package edu.cit.canete.laundrylink.features.booking;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.cit.canete.laundrylink.shared.config.SecurityConfig;
import edu.cit.canete.laundrylink.shared.web.ApiResponseFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for {@link BookingController} — FR-08, FR-11, FR-04.
 *
 * Uses {@code @WebMvcTest} so only the web layer is loaded; no real database is needed.
 */
@WebMvcTest(BookingController.class)
@Import({ApiResponseFactory.class, SecurityConfig.class})
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BookingService bookingService;

    // ------------------------------------------------------------------
    // Shared test data
    // ------------------------------------------------------------------

    private static final UUID SHOP_ID    = UUID.fromString("aaaaaaaa-0000-0000-0000-000000000001");
    private static final UUID SERVICE_ID = UUID.fromString("bbbbbbbb-0000-0000-0000-000000000002");
    private static final UUID BOOKING_ID = UUID.fromString("cccccccc-0000-0000-0000-000000000003");

    private static final Map<String, Object> VALID_BOOKING_MAP = Map.of(
            "id",          BOOKING_ID,
            "bookingCode", "BL-ABCD1234",
            "status",      "PENDING_PAYMENT",
            "bookingDate", "2025-08-01",
            "timeSlot",    "09:00",
            "shopId",      SHOP_ID,
            "serviceId",   SERVICE_ID,
            "fileUrl",     "",
            "qrCodeUrl",   ""
    );

    private String validCreateBookingBody() {
        return """
                {
                  "shopId": "%s",
                  "serviceId": "%s",
                  "date": "2025-08-01",
                  "timeSlot": "09:00"
                }
                """.formatted(SHOP_ID, SERVICE_ID);
    }

    // ------------------------------------------------------------------
    // TC-08-04  POST /api/bookings without Authorization header → 4xx
    // ------------------------------------------------------------------

    @Test
    @DisplayName("TC-08-04: POST /api/bookings with no Authorization header → 4xx")
    void createBooking_noAuthorizationHeader_returns4xx() throws Exception {
        when(bookingService.createBooking(any(), eq(null)))
                .thenThrow(new RuntimeException("AUTH-002: No authorization token provided"));

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validCreateBookingBody()))
                .andExpect(status().is4xxClientError());
    }

    // ------------------------------------------------------------------
    // TC-08-01  POST /api/bookings with valid auth header → 201 + booking
    // ------------------------------------------------------------------

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("TC-08-01: POST /api/bookings with valid token returns 201 and booking data")
    void createBooking_withValidToken_returns201() throws Exception {
        when(bookingService.createBooking(any(), any())).thenReturn(VALID_BOOKING_MAP);

        mockMvc.perform(post("/api/bookings")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer valid.jwt.token")
                        .content(validCreateBookingBody()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.bookingCode").value("BL-ABCD1234"))
                .andExpect(jsonPath("$.data.status").value("PENDING_PAYMENT"));
    }

    // ------------------------------------------------------------------
    // TC-08-02  POST /api/bookings — slot already full → 409
    // ------------------------------------------------------------------

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("TC-08-02: POST /api/bookings when slot is full returns 409 Conflict")
    void createBooking_slotFull_returns409() throws Exception {
        when(bookingService.createBooking(any(), any()))
                .thenThrow(new RuntimeException("SLOT-002: Daily Priority slot limit reached"));

        mockMvc.perform(post("/api/bookings")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer valid.jwt.token")
                        .content(validCreateBookingBody()))
                .andExpect(status().isConflict());
    }

    // ------------------------------------------------------------------
    // TC-08-03  POST /api/bookings — missing required field → 400
    // ------------------------------------------------------------------

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("TC-08-03: POST /api/bookings with missing shopId returns 400")
    void createBooking_missingShopId_returns400() throws Exception {
        String body = """
                {
                  "serviceId": "%s",
                  "date": "2025-08-01",
                  "timeSlot": "09:00"
                }
                """.formatted(SERVICE_ID);

        mockMvc.perform(post("/api/bookings")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer valid.jwt.token")
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    // ------------------------------------------------------------------
    // TC-11-01  GET /api/bookings/my with valid token → 200 + list
    // ------------------------------------------------------------------

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("TC-11-01: GET /api/bookings/my with valid token returns 200 and booking list")
    void listMyBookings_withValidToken_returns200() throws Exception {
        when(bookingService.listMyBookings(any()))
                .thenReturn(List.of(VALID_BOOKING_MAP));

        mockMvc.perform(get("/api/bookings/my")
                        .header("Authorization", "Bearer valid.jwt.token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].bookingCode").value("BL-ABCD1234"));
    }

    // ------------------------------------------------------------------
    // TC-11-02  GET /api/bookings/my without token → 401
    // ------------------------------------------------------------------

    @Test
    @DisplayName("TC-11-02: GET /api/bookings/my without token returns 401")
    void listMyBookings_noToken_returns401() throws Exception {
        when(bookingService.listMyBookings(eq(null)))
                .thenThrow(new RuntimeException("AUTH-002: No authorization token provided"));

        mockMvc.perform(get("/api/bookings/my"))
                .andExpect(status().isUnauthorized());
    }

    // ------------------------------------------------------------------
    // TC-11-03  GET /api/bookings/{id} — booking found and owned → 200
    // ------------------------------------------------------------------

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("TC-11-03: GET /api/bookings/{id} for owned booking returns 200")
    void getBooking_ownedBooking_returns200() throws Exception {
        when(bookingService.getBooking(eq(BOOKING_ID), any()))
                .thenReturn(VALID_BOOKING_MAP);

        mockMvc.perform(get("/api/bookings/{id}", BOOKING_ID)
                        .header("Authorization", "Bearer valid.jwt.token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(BOOKING_ID.toString()));
    }

    // ------------------------------------------------------------------
    // TC-04-02  GET /api/bookings/{id} for another user's booking → 403
    // ------------------------------------------------------------------

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("TC-04-02: GET /api/bookings/{id} for another user's booking returns 403")
    void getBooking_notOwnedByUser_returns403() throws Exception {
        when(bookingService.getBooking(eq(BOOKING_ID), any()))
                .thenThrow(new RuntimeException("AUTH-003: You can only access your own booking"));

        mockMvc.perform(get("/api/bookings/{id}", BOOKING_ID)
                        .header("Authorization", "Bearer valid.jwt.token"))
                .andExpect(status().isForbidden());
    }

    // ------------------------------------------------------------------
    // TC-04-05  GET /api/bookings/{id} — booking not found → 404
    // ------------------------------------------------------------------

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("TC-04-05: GET /api/bookings/{id} for non-existent booking returns 404")
    void getBooking_notFound_returns404() throws Exception {
        UUID unknownId = UUID.randomUUID();
        when(bookingService.getBooking(eq(unknownId), any()))
                .thenThrow(new RuntimeException("BOOKING-001: Booking not found"));

        mockMvc.perform(get("/api/bookings/{id}", unknownId)
                        .header("Authorization", "Bearer admin.jwt.token"))
                .andExpect(status().isNotFound());
    }

    // ------------------------------------------------------------------
    // TC-11-04  GET /api/bookings/my with ADMIN role → 200
    // ------------------------------------------------------------------

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("TC-11-04: GET /api/bookings/my with ADMIN role returns 200 (empty list)")
    void listMyBookings_adminRole_returns200() throws Exception {
        when(bookingService.listMyBookings(any()))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/bookings/my")
                        .header("Authorization", "Bearer admin.jwt.token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }
}
