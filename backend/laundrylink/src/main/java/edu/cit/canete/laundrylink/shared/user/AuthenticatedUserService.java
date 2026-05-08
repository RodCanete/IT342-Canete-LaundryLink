package edu.cit.canete.laundrylink.shared.user;

import edu.cit.canete.laundrylink.shared.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthenticatedUserService {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    public User requireUser(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = authorizationHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("Invalid or expired token");
        }

        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    public User requireAdmin(String authorizationHeader) {
        User user = requireUser(authorizationHeader);
        if (!UserRole.ADMIN.name().equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("AUTH-002: Admin access required");
        }
        return user;
    }
}
