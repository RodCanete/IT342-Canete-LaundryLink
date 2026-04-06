package edu.cit.canete.laundrylink.controller;

import edu.cit.canete.laundrylink.dto.CreateBookingRequest;
import edu.cit.canete.laundrylink.service.ApiResponseFactory;
import edu.cit.canete.laundrylink.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private ApiResponseFactory responseFactory;

    @PostMapping
    public ResponseEntity<?> createBooking(
        @Valid @RequestBody CreateBookingRequest request,
        @RequestHeader(name = "Authorization", required = false) String authorizationHeader
    ) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(responseFactory.success(bookingService.createBooking(request, authorizationHeader)));
        } catch (RuntimeException e) {
            HttpStatus status = e.getMessage().startsWith("SLOT-") ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(responseFactory.error("BOOKING-001", e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> listMyBookings(
        @RequestHeader(name = "Authorization", required = false) String authorizationHeader
    ) {
        try {
            return ResponseEntity.ok(responseFactory.success(bookingService.listMyBookings(authorizationHeader)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(responseFactory.error("AUTH-002", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBooking(
        @PathVariable UUID id,
        @RequestHeader(name = "Authorization", required = false) String authorizationHeader
    ) {
        try {
            return ResponseEntity.ok(responseFactory.success(bookingService.getBooking(id, authorizationHeader)));
        } catch (RuntimeException e) {
            HttpStatus status = e.getMessage().startsWith("AUTH-") ? HttpStatus.FORBIDDEN : HttpStatus.NOT_FOUND;
            return ResponseEntity.status(status).body(responseFactory.error("BOOKING-001", e.getMessage()));
        }
    }
}