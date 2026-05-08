package edu.cit.canete.laundrylink.features.admin;

import edu.cit.canete.laundrylink.features.admin.dto.AdminSetDailyPriorityLimitRequest;
import edu.cit.canete.laundrylink.features.booking.BookingService;
import edu.cit.canete.laundrylink.features.booking.BookingStatus;
import edu.cit.canete.laundrylink.features.booking.dto.UpdateBookingStatusRequest;
import edu.cit.canete.laundrylink.shared.user.AuthenticatedUserService;
import edu.cit.canete.laundrylink.shared.web.ApiResponseFactory;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private AuthenticatedUserService authenticatedUserService;

    @Autowired
    private ApiResponseFactory responseFactory;

    @GetMapping("/bookings")
    public ResponseEntity<?> listAllBookings(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam(required = false) BookingStatus status,
        @RequestParam(required = false) UUID shopId,
        @RequestParam(required = false) String q,
        @RequestHeader(name = "Authorization", required = false) String auth
    ) {
        try {
            authenticatedUserService.requireAdmin(auth);
            return ResponseEntity.ok(responseFactory.success(
                adminService.listAllBookings(date, status, shopId, q)
            ));
        } catch (RuntimeException e) {
            return errorFor(e);
        }
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<?> updateBookingStatus(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateBookingStatusRequest req,
        @RequestHeader(name = "Authorization", required = false) String auth
    ) {
        try {
            authenticatedUserService.requireAdmin(auth);
            return ResponseEntity.ok(responseFactory.success(
                adminService.updateBookingStatus(id, req.getStatus(), bookingService)
            ));
        } catch (RuntimeException e) {
            return errorFor(e);
        }
    }

    @GetMapping("/shops")
    public ResponseEntity<?> listShopsWithPriorityUsage(
        @RequestHeader(name = "Authorization", required = false) String auth
    ) {
        try {
            authenticatedUserService.requireAdmin(auth);
            return ResponseEntity.ok(responseFactory.success(
                adminService.listShopsWithPriorityUsage()
            ));
        } catch (RuntimeException e) {
            return errorFor(e);
        }
    }

    @PutMapping("/slots")
    public ResponseEntity<?> setDailyPriorityLimit(
        @Valid @RequestBody AdminSetDailyPriorityLimitRequest req,
        @RequestHeader(name = "Authorization", required = false) String auth
    ) {
        try {
            authenticatedUserService.requireAdmin(auth);
            return ResponseEntity.ok(responseFactory.success(
                adminService.setDailyPriorityLimit(req)
            ));
        } catch (RuntimeException e) {
            return errorFor(e);
        }
    }

    private ResponseEntity<?> errorFor(RuntimeException e) {
        String msg = e.getMessage() == null ? "Request failed" : e.getMessage();
        HttpStatus status;
        String code;
        if (msg.startsWith("AUTH-002")) {
            status = HttpStatus.FORBIDDEN;
            code = "AUTH-002";
        } else if (msg.startsWith("AUTH-")) {
            status = HttpStatus.FORBIDDEN;
            code = msg.split(":")[0];
        } else if (msg.startsWith("ADMIN-001") || msg.startsWith("ADMIN-002")) {
            status = HttpStatus.NOT_FOUND;
            code = msg.split(":")[0];
        } else if (msg.startsWith("ADMIN-")) {
            status = HttpStatus.BAD_REQUEST;
            code = msg.split(":")[0];
        } else if (msg.startsWith("BOOKING-002")) {
            status = HttpStatus.BAD_REQUEST;
            code = "BOOKING-002";
        } else if (msg.startsWith("BOOKING-")) {
            status = HttpStatus.NOT_FOUND;
            code = msg.split(":")[0];
        } else if (msg.startsWith("Missing or invalid Authorization") || msg.startsWith("Invalid or expired token")) {
            status = HttpStatus.UNAUTHORIZED;
            code = "AUTH-001";
        } else {
            status = HttpStatus.BAD_REQUEST;
            code = "ADMIN-999";
        }
        return ResponseEntity.status(status).body(responseFactory.error(code, msg));
    }
}
