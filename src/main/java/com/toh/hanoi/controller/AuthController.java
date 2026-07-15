package com.toh.hanoi.controller;

import com.toh.hanoi.service.AuthService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public Map<String, Object> signup(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String email = payload.get("email");
        String password = payload.get("password");

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Username and password are required");
        }

        var user = authService.register(username, email == null ? "" : email, password);
        return Map.of("success", true, "message", "Account created", "user", Map.of("username", user.getUsername(), "email", user.getEmail()));
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String password = payload.get("password");

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Username and password are required");
        }

        var user = authService.login(username, password);
        return Map.of("success", true, "message", "Login successful", "user", Map.of("username", user.getUsername(), "email", user.getEmail()));
    }
}
