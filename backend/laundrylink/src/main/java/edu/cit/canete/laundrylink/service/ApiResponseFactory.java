package edu.cit.canete.laundrylink.service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

@Component
public class ApiResponseFactory {

    public Map<String, Object> success(Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        response.put("error", null);
        response.put("timestamp", Instant.now());
        return response;
    }

    public Map<String, Object> error(String code, String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("code", code);
        error.put("message", message);

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("data", null);
        response.put("error", error);
        response.put("timestamp", Instant.now());
        return response;
    }
}