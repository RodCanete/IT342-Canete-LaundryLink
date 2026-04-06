package edu.cit.canete.laundrylink.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import edu.cit.canete.laundrylink.dto.GoogleOAuthRequest;
import edu.cit.canete.laundrylink.dto.RegisterRequest;
import edu.cit.canete.laundrylink.entity.User;
import edu.cit.canete.laundrylink.repository.UserRepository;
import edu.cit.canete.laundrylink.security.GoogleTokenVerifier;
import edu.cit.canete.laundrylink.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private GoogleTokenVerifier googleTokenVerifier;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerDefaultsToCustomerWhenRoleIsMissing() {
        when(userRepository.existsByEmail("customer@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> savedUser(invocation.getArgument(0)));
        when(jwtUtil.generateToken("customer@example.com", "CUSTOMER")).thenReturn("token-customer");

        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Juan");
        request.setLastName("Dela Cruz");
        request.setEmail("customer@example.com");
        request.setPassword("SecurePass123");

        Map<String, Object> response = authService.register(request);

        Map<String, Object> user = castUser(response.get("user"));
        assertEquals("CUSTOMER", user.get("role"));
        assertEquals("token-customer", response.get("accessToken"));
    }

    @Test
    void registerAllowsShopOwnerRole() {
        when(userRepository.existsByEmail("owner@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> savedUser(invocation.getArgument(0)));
        when(jwtUtil.generateToken("owner@example.com", "SHOP_OWNER")).thenReturn("token-owner");

        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Ana");
        request.setLastName("Reyes");
        request.setEmail("owner@example.com");
        request.setPassword("SecurePass123");
        request.setRole("SHOP_OWNER");

        Map<String, Object> response = authService.register(request);

        Map<String, Object> user = castUser(response.get("user"));
        assertEquals("SHOP_OWNER", user.get("role"));
        assertEquals("token-owner", response.get("accessToken"));
    }

    @Test
    void registerRejectsAdminRole() {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Admin");
        request.setLastName("User");
        request.setEmail("admin@example.com");
        request.setPassword("SecurePass123");
        request.setRole("ADMIN");

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.register(request));

        assertEquals("Admin accounts cannot be created through registration", exception.getMessage());
    }

    @Test
    void registerRejectsDuplicateEmail() {
        when(userRepository.existsByEmail("dup@example.com")).thenReturn(true);

        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Juan");
        request.setLastName("Dela Cruz");
        request.setEmail("dup@example.com");
        request.setPassword("SecurePass123");
        request.setRole("CUSTOMER");

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.register(request));

        assertEquals("Email already registered", exception.getMessage());
    }

    @Test
    void googleLoginDefaultsToCustomerRole() {
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail("google@example.com");
        payload.setSubject("google-subject");
        payload.set("given_name", "Google");
        payload.set("family_name", "User");

        when(googleTokenVerifier.verify("google-token")).thenReturn(payload);
        when(userRepository.findByOauthProviderAndOauthId("GOOGLE", "google-subject")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("google@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> savedUser(invocation.getArgument(0)));
        when(jwtUtil.generateToken("google@example.com", "CUSTOMER")).thenReturn("token-google");

        GoogleOAuthRequest request = new GoogleOAuthRequest();
        request.setIdToken("google-token");

        Map<String, Object> response = authService.googleLogin(request);

        Map<String, Object> user = castUser(response.get("user"));
        assertEquals("CUSTOMER", user.get("role"));
        assertEquals("token-google", response.get("accessToken"));
    }

    private User savedUser(User user) {
        if (user.getId() == null) {
            user.setId(UUID.randomUUID());
        }
        return user;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> castUser(Object value) {
        return (Map<String, Object>) value;
    }
}