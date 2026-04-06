package edu.cit.canete.laundrylink.controller;

import edu.cit.canete.laundrylink.dto.CreatePaymentIntentRequest;
import edu.cit.canete.laundrylink.service.ApiResponseFactory;
import edu.cit.canete.laundrylink.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseFactory.error("PAYMENT-001", e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> webhook(@RequestParam String paymentIntentId) {
        try {
            return ResponseEntity.ok(responseFactory.success(paymentService.handleWebhook(paymentIntentId)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseFactory.error("PAYMENT-002", e.getMessage()));
        }
    }
}