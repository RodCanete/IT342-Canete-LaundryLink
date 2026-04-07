package edu.cit.canete.laundrylink.service;

import edu.cit.canete.laundrylink.dto.*;
import edu.cit.canete.laundrylink.entity.User;
import edu.cit.canete.laundrylink.entity.UserRole;
import edu.cit.canete.laundrylink.repository.UserRepository;
import edu.cit.canete.laundrylink.security.GoogleTokenVerifier;
import edu.cit.canete.laundrylink.security.JwtUtil;
import edu.cit.canete.laundrylink.service.adapter.GoogleOAuthProfile;
import edu.cit.canete.laundrylink.service.adapter.GooglePayloadAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private GoogleTokenVerifier googleTokenVerifier;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private GooglePayloadAdapter googlePayloadAdapter;

    public Map<String, Object> register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        if (!UserRole.isSelfServiceRole(req.getRole())) {
            throw new RuntimeException("Admin accounts cannot be created through registration");
        }

        User user = new User();
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setEmail(req.getEmail());
        user.setPasswordHash(encoder.encode(req.getPassword()));
        user.setRole(UserRole.normalizeForRegistration(req.getRole()));
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    public Map<String, Object> login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (user.getPasswordHash() == null || !encoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        return buildAuthResponse(user);
    }

    public Map<String, Object> googleLogin(GoogleOAuthRequest req) {
        if (req.getIdToken() == null || req.getIdToken().isBlank()) {
            throw new IllegalArgumentException("Google ID token is required");
        }

        GoogleIdToken.Payload payload = googleTokenVerifier.verify(req.getIdToken());
        GoogleOAuthProfile profile = googlePayloadAdapter.adapt(payload);
        String email = profile.email();
        String oauthId = profile.oauthId();

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Google account did not return an email address");
        }

        if (oauthId == null || oauthId.isBlank()) {
            throw new RuntimeException("Google account did not return a subject identifier");
        }

        User user = userRepository.findByOauthProviderAndOauthId("GOOGLE", oauthId)
            .orElseGet(() -> userRepository.findByEmail(email)
                .map(existingUser -> linkGoogleAccount(existingUser, oauthId))
                .orElseGet(() -> createGoogleUser(profile)));

        return buildAuthResponse(user);
    }

    private User linkGoogleAccount(User user, String oauthId) {
        user.setOauthProvider("GOOGLE");
        user.setOauthId(oauthId);
        return userRepository.save(user);
    }

    private User createGoogleUser(GoogleOAuthProfile profile) {
        User user = new User();
        user.setEmail(profile.email());
        user.setOauthProvider("GOOGLE");
        user.setOauthId(profile.oauthId());
        user.setRole(UserRole.CUSTOMER.name());

        user.setFirstName(profile.firstName());
        user.setLastName(profile.lastName());
        return userRepository.save(user);
    }

    private Map<String, Object> buildAuthResponse(User user) {
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        Map<String, Object> response = new HashMap<>();
        response.put("user", Map.of(
            "id", user.getId().toString(),
            "email", user.getEmail(),
            "firstName", user.getFirstName(),
            "lastName", user.getLastName(),
            "role", user.getRole()
        ));
        response.put("accessToken", token);
        return response;
    }
}
