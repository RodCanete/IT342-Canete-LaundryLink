package edu.cit.canete.laundrylink.controller;

import edu.cit.canete.laundrylink.dto.*;
import edu.cit.canete.laundrylink.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
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
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            response.put("error", null);
            response.put("timestamp", Instant.now());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("code", "AUTH-409");
            error.put("message", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("data", null);
            response.put("error", error);
            response.put("timestamp", Instant.now());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            var data = authService.login(req);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            response.put("error", null);
            response.put("timestamp", Instant.now());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("code", "AUTH-001");
            error.put("message", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("data", null);
            response.put("error", error);
            response.put("timestamp", Instant.now());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        Map<String, Object> data = new HashMap<>();
        data.put("status", "healthy");
        data.put("service", "LaundryLink Auth");
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        response.put("error", null);
        response.put("timestamp", Instant.now());
        return ResponseEntity.ok(response);
    }
}