package com.mydbs.backend.auth.controller;

import com.mydbs.backend.auth.dto.AuthResponse;
import com.mydbs.backend.auth.dto.LoginRequest;
import com.mydbs.backend.auth.service.AuthService;
import com.mydbs.backend.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success("Connexion reussie", authService.login(request));
    }
}