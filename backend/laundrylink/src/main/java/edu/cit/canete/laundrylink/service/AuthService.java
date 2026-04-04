package edu.cit.canete.laundrylink.service;

import edu.cit.canete.laundrylink.dto.*;
import edu.cit.canete.laundrylink.entity.User;
import edu.cit.canete.laundrylink.repository.UserRepository;
import edu.cit.canete.laundrylink.security.GoogleTokenVerifier;
import edu.cit.canete.laundrylink.security.JwtUtil;
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

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public Map<String, Object> register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setEmail(req.getEmail());
        user.setPasswordHash(encoder.encode(req.getPassword()));
        user.setRole("CUSTOMER");
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
        String email = payload.getEmail();
        String oauthId = payload.getSubject();

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Google account did not return an email address");
        }

        if (oauthId == null || oauthId.isBlank()) {
            throw new RuntimeException("Google account did not return a subject identifier");
        }

        User user = userRepository.findByOauthProviderAndOauthId("GOOGLE", oauthId)
            .orElseGet(() -> userRepository.findByEmail(email)
                .map(existingUser -> linkGoogleAccount(existingUser, oauthId))
                .orElseGet(() -> createGoogleUser(payload, email, oauthId)));

        return buildAuthResponse(user);
    }

    private User linkGoogleAccount(User user, String oauthId) {
        user.setOauthProvider("GOOGLE");
        user.setOauthId(oauthId);
        return userRepository.save(user);
    }

    private User createGoogleUser(GoogleIdToken.Payload payload, String email, String oauthId) {
        User user = new User();
        user.setEmail(email);
        user.setOauthProvider("GOOGLE");
        user.setOauthId(oauthId);
        user.setRole("CUSTOMER");

        String fullName = payload.get("name") != null ? payload.get("name").toString() : null;
        String givenName = payload.get("given_name") != null ? payload.get("given_name").toString() : null;
        String familyName = payload.get("family_name") != null ? payload.get("family_name").toString() : null;

        if (givenName == null || givenName.isBlank() || familyName == null || familyName.isBlank()) {
            String[] nameParts = splitGoogleName(fullName);
            if (givenName == null || givenName.isBlank()) {
                givenName = nameParts[0];
            }
            if (familyName == null || familyName.isBlank()) {
                familyName = nameParts[1];
            }
        }

        user.setFirstName(givenName);
        user.setLastName(familyName);
        return userRepository.save(user);
    }

    private String[] splitGoogleName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return new String[] {"Google", "User"};
        }

        String trimmed = fullName.trim();
        int firstSpaceIndex = trimmed.indexOf(' ');

        if (firstSpaceIndex < 0) {
            return new String[] {trimmed, "User"};
        }

        String firstName = trimmed.substring(0, firstSpaceIndex).trim();
        String lastName = trimmed.substring(firstSpaceIndex + 1).trim();
        if (lastName.isBlank()) {
            lastName = "User";
        }

        return new String[] {firstName.isBlank() ? "Google" : firstName, lastName};
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
