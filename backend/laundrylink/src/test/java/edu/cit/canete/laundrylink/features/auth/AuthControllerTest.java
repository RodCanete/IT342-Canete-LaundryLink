package edu.cit.canete.laundrylink.features.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.cit.canete.laundrylink.shared.web.ApiResponseFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for {@link AuthController} — FR-01, FR-02, FR-04.
 *
 * Uses {@code @WebMvcTest} so only the web layer is loaded; no real database is needed.
 * All endpoints under {@code /api/auth/**} are permit-all in SecurityConfig, so no
 * mock authentication token is required for these tests.
 */
@WebMvcTest(AuthController.class)
@Import(ApiResponseFactory.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private static final Map<String, Object> VALID_AUTH_RESPONSE = Map.of(
            "accessToken", "eyJhbGciOiJIUzI1NiJ9.test",
            "user", Map.of(
                    "id", "00000000-0000-0000-0000-000000000001",
                    "email", "juan@example.com",
                    "firstName", "Juan",
                    "lastName", "Dela Cruz",
                    "role", "CUSTOMER"
            )
    );

    // ------------------------------------------------------------------
    // TC-01-01  Register — valid payload → 201 + token in response
    // ------------------------------------------------------------------

    @Test
    @DisplayName("TC-01-01: POST /api/auth/register with valid payload returns 201 and accessToken")
    void register_validPayload_returns201WithToken() throws Exception {
        when(authService.register(any())).thenReturn(VALID_AUTH_RESPONSE);

        String body = """
                {
                  "firstName": "Juan",
                  "lastName": "Dela Cruz",
                  "email": "juan@example.com",
                  "password": "SecurePass123",
                  "role": "CUSTOMER"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").exists());
    }

    // ------------------------------------------------------------------
    // TC-01-02  Register — duplicate email → 409
    // ------------------------------------------------------------------

    @Test
    @DisplayName("TC-01-02: POST /api/auth/register with duplicate email returns 409")
    void register_duplicateEmail_returns409() throws Exception {
        when(authService.register(any()))
                .thenThrow(new RuntimeException("Email already registered"));

        String body = """
                {
                  "firstName": "Juan",
                  "lastName": "Dela Cruz",
                  "email": "dup@example.com",
                  "password": "SecurePass123",
                  "role": "CUSTOMER"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("AUTH-409"))
                .andExpect(jsonPath("$.error.message").value("Email already registered"));
    }

    // ------------------------------------------------------------------
    // TC-01-03  Register — missing required fields (blank email) → 400
    // ------------------------------------------------------------------

    @Test
    @DisplayName("TC-01-03: POST /api/auth/register with blank email returns 400")
    void register_blankEmail_returns400() throws Exception {
        String body = """
                {
                  "firstName": "Juan",
                  "lastName": "Dela Cruz",
                  "email": "",
                  "password": "SecurePass123"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC-01-03b: POST /api/auth/register with blank password returns 400")
    void register_blankPassword_returns400() throws Exception {
        String body = """
                {
                  "firstName": "Juan",
                  "lastName": "Dela Cruz",
                  "email": "juan@example.com",
                  "password": ""
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC-01-03c: POST /api/auth/register with short password (< 8 chars) returns 400")
    void register_shortPassword_returns400() throws Exception {
        String body = """
                {
                  "firstName": "Juan",
                  "lastName": "Dela Cruz",
                  "email": "juan@example.com",
                  "password": "short"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    // ------------------------------------------------------------------
    // TC-02-01  Login — valid credentials → 200 + token
    // ------------------------------------------------------------------

    @Test
    @DisplayName("TC-02-01: POST /api/auth/login with valid credentials returns 200 and accessToken")
    void login_validCredentials_returns200WithToken() throws Exception {
        when(authService.login(any())).thenReturn(VALID_AUTH_RESPONSE);

        String body = """
                {
                  "email": "juan@example.com",
                  "password": "SecurePass123"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").exists());
    }

    // ------------------------------------------------------------------
    // TC-02-02  Login — wrong password → 401
    // ------------------------------------------------------------------

    @Test
    @DisplayName("TC-02-02: POST /api/auth/login with wrong password returns 401")
    void login_wrongPassword_returns401() throws Exception {
        when(authService.login(any()))
                .thenThrow(new RuntimeException("Invalid email or password"));

        String body = """
                {
                  "email": "juan@example.com",
                  "password": "WrongPassword!"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("AUTH-001"))
                .andExpect(jsonPath("$.error.message").value("Invalid email or password"));
    }

    // ------------------------------------------------------------------
    // TC-04-07  Health endpoint — public, no auth needed → 200
    // ------------------------------------------------------------------

    @Test
    @DisplayName("TC-04-07: GET /api/auth/health without auth header returns 200")
    void health_noAuth_returns200() throws Exception {
        mockMvc.perform(get("/api/auth/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("healthy"))
                .andExpect(jsonPath("$.data.service").value("LaundryLink Auth"));
    }
}
