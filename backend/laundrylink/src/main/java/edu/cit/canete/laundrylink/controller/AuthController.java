package edu.cit.canete.laundrylink.controller;

import edu.cit.canete.laundrylink.dto.*;
import edu.cit.canete.laundrylink.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        try {
            var data = authService.register(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                    "success", true,
                    "data", data,
                    "error", null,
                    "timestamp", Instant.now()
                )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of(
                    "success", false,
                    "data", null,
                    "error", Map.of(
                        "code", "AUTH-409",
                        "message", e.getMessage()
                    ),
                    "timestamp", Instant.now()
                )
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            var data = authService.login(req);
            return ResponseEntity.ok(
                Map.of(
                    "success", true,
                    "data", data,
                    "error", null,
                    "timestamp", Instant.now()
                )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of(
                    "success", false,
                    "data", null,
                    "error", Map.of(
                        "code", "AUTH-001",
                        "message", e.getMessage()
                    ),
                    "timestamp", Instant.now()
                )
            );
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(
            Map.of(
                "success", true,
                "data", Map.of("status", "healthy", "service", "LaundryLink Auth"),
                "error", null,
                "timestamp", Instant.now()
            )
        );
    }
}
