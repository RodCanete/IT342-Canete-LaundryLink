package edu.cit.canete.laundrylink.controller;

import edu.cit.canete.laundrylink.dto.CreatePaymentIntentRequest;
import edu.cit.canete.laundrylink.service.ApiResponseFactory;
import edu.cit.canete.laundrylink.service.PaymentService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private ApiResponseFactory responseFactory;

    @PostMapping("/create-intent")
    public ResponseEntity<?> createIntent(
        @Valid @RequestBody CreatePaymentIntentRequest request,
        @RequestHeader(name = "Authorization", required = false) String authorizationHeader
    ) {
        try {
            return ResponseEntity.ok(responseFactory.success(paymentService.createIntent(request, authorizationHeader)));
        } catch (RuntimeException e) {
            return buildErrorResponse(e, "PAYMENT-001");
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> webhook(
        @RequestBody(required = false) String payload,
        @RequestHeader(name = "paymongo-signature", required = false) String signature,
        @RequestParam(name = "paymentIntentId", required = false) String paymentIntentId
    ) {
        try {
            return ResponseEntity.ok(responseFactory.success(paymentService.handleWebhook(payload, signature, paymentIntentId)));
        } catch (RuntimeException e) {
            return buildErrorResponse(e, "PAYMENT-002");
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getPaymentByBooking(
        @PathVariable UUID bookingId,
        @RequestHeader(name = "Authorization", required = false) String authorizationHeader
    ) {
        try {
            return ResponseEntity.ok(responseFactory.success(paymentService.getPaymentByBooking(bookingId, authorizationHeader)));
        } catch (RuntimeException e) {
            return buildErrorResponse(e, "PAYMENT-003");
        }
    }

    private ResponseEntity<?> buildErrorResponse(RuntimeException e, String fallbackCode) {
        String message = e.getMessage() == null ? "Unexpected payment error" : e.getMessage();
        String errorCode = extractErrorCode(message, fallbackCode);
        HttpStatus status = mapStatus(message);
        return ResponseEntity.status(status).body(responseFactory.error(errorCode, message));
    }

    private String extractErrorCode(String message, String fallbackCode) {
        int separator = message.indexOf(':');
        if (separator > 0) {
            String code = message.substring(0, separator).trim();
            if (!code.isBlank() && code.matches("[A-Z]+-\\d+")) {
                return code;
            }
        }

        if ("Missing or invalid Authorization header".equals(message)) {
            return "AUTH-001";
        }
        if ("Invalid or expired token".equals(message)) {
            return "AUTH-002";
        }
        if ("Authenticated user not found".equals(message)) {
            return "AUTH-004";
        }

        return fallbackCode;
    }

    private HttpStatus mapStatus(String message) {
        if ("Missing or invalid Authorization header".equals(message) ||
            "Invalid or expired token".equals(message) ||
            "Authenticated user not found".equals(message)) {
            return HttpStatus.UNAUTHORIZED;
        }

        if (message.startsWith("AUTH-")) {
            return HttpStatus.FORBIDDEN;
        }

        if (message.startsWith("BOOKING-001") ||
            message.startsWith("PAYMENT-001: No payment initialized for this booking")) {
            return HttpStatus.NOT_FOUND;
        }

        if (message.startsWith("PAYMENT-001: Booking is not pending payment")) {
            return HttpStatus.CONFLICT;
        }

        return HttpStatus.BAD_REQUEST;
    }
}