package edu.cit.canete.laundrylink.shared.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    // Must be at least 32 characters for HMAC-SHA256
    private static final String SECRET =
            "test-secret-key-that-is-at-least-256-bits-long-for-hmac-sha256";
    private static final long EXPIRATION_MS = 3_600_000L; // 1 hour

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", SECRET);
        ReflectionTestUtils.setField(jwtUtil, "expirationMs", EXPIRATION_MS);
    }

    // ── TC-02-04: token contains correct email and role claims ────────────────

    @Test
    void generateToken_containsCorrectEmailClaim() {
        String token = jwtUtil.generateToken("user@example.com", "CUSTOMER");

        assertNotNull(token, "Token must not be null");
        assertEquals("user@example.com", jwtUtil.extractEmail(token));
    }

    @Test
    void generateToken_containsCorrectRoleClaim() {
        String token = jwtUtil.generateToken("user@example.com", "CUSTOMER");
        assertEquals("CUSTOMER", jwtUtil.extractRole(token));
    }

    // ── valid token → validateToken returns true ───────────────────────────────

    @Test
    void validateToken_validToken_returnsTrue() {
        String token = jwtUtil.generateToken("user@example.com", "CUSTOMER");
        assertTrue(jwtUtil.validateToken(token));
    }

    // ── TC-02-06: tampered signature → validateToken returns false ────────────

    @Test
    void validateToken_tamperedSignature_returnsFalse() {
        String token = jwtUtil.generateToken("user@example.com", "CUSTOMER");
        // Corrupt the signature segment (last part after final '.')
        String tampered = token + "tampered";
        assertFalse(jwtUtil.validateToken(tampered),
                "Tampered token should fail validation");
    }

    @Test
    void validateToken_modifiedPayload_returnsFalse() {
        String token = jwtUtil.generateToken("user@example.com", "CUSTOMER");
        // Replace all 'a' in the token with 'b' — breaks the signature
        String corrupted = token.replace('a', 'z');
        // Only assert false if the replacement actually changed something
        if (!corrupted.equals(token)) {
            assertFalse(jwtUtil.validateToken(corrupted),
                    "Modified token should fail validation");
        }
    }

    // ── TC-02-05 (adapted): expired token → validateToken returns false ────────
    //   JwtUtil has no isTokenExpired(); we test via validateToken with -1000ms TTL

    @Test
    void validateToken_expiredToken_returnsFalse() {
        JwtUtil expiredJwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(expiredJwtUtil, "secret", SECRET);
        ReflectionTestUtils.setField(expiredJwtUtil, "expirationMs", -1000L);

        String expiredToken = expiredJwtUtil.generateToken("user@example.com", "CUSTOMER");
        assertFalse(expiredJwtUtil.validateToken(expiredToken),
                "Expired token should fail validation");
    }

    // ── extractRole returns correct role for each role value ──────────────────

    @Test
    void extractRole_returnsShopOwnerRole() {
        String token = jwtUtil.generateToken("owner@example.com", "SHOP_OWNER");
        assertEquals("SHOP_OWNER", jwtUtil.extractRole(token));
    }

    @Test
    void extractRole_returnsAdminRole() {
        String token = jwtUtil.generateToken("admin@example.com", "ADMIN");
        assertEquals("ADMIN", jwtUtil.extractRole(token));
    }

    // ── different emails produce different tokens ──────────────────────────────

    @Test
    void generateToken_differentEmails_produceDifferentTokens() {
        String token1 = jwtUtil.generateToken("alice@example.com", "CUSTOMER");
        String token2 = jwtUtil.generateToken("bob@example.com", "CUSTOMER");
        assertNotEquals(token1, token2,
                "Tokens for different emails must differ");
    }

    // ── token is non-empty and has 3 JWT segments ─────────────────────────────

    @Test
    void generateToken_hasThreeSegments() {
        String token = jwtUtil.generateToken("user@example.com", "CUSTOMER");
        String[] parts = token.split("\\.");
        assertEquals(3, parts.length,
                "JWT must have exactly 3 dot-separated segments");
    }
}
