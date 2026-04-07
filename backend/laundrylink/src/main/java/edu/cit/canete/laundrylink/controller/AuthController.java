package edu.cit.canete.laundrylink.controller;

import edu.cit.canete.laundrylink.dto.*;
import edu.cit.canete.laundrylink.service.ApiResponseFactory;
import edu.cit.canete.laundrylink.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private ApiResponseFactory responseFactory;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        try {
            var data = authService.register(req);
            return responseFactory.successResponse(data, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return responseFactory.errorResponse("AUTH-409", e.getMessage(), HttpStatus.CONFLICT);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            var data = authService.login(req);
            return responseFactory.successResponse(data, HttpStatus.OK);
        } catch (RuntimeException e) {
            return responseFactory.errorResponse("AUTH-001", e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleOAuthRequest req) {
        try {
            var data = authService.googleLogin(req);
            return responseFactory.successResponse(data, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return responseFactory.errorResponse("AUTH-400", e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return responseFactory.errorResponse("AUTH-002", e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        Map<String, Object> data = new java.util.HashMap<>();
        data.put("status", "healthy");
        data.put("service", "LaundryLink Auth");
        return responseFactory.successResponse(data, HttpStatus.OK);
    }
}