package com.careermetric.auth.controller;

import com.careermetric.auth.dto.AuthResponse;
import com.careermetric.auth.dto.GoogleLoginRequest;
import com.careermetric.auth.dto.LoginRequest;
import com.careermetric.auth.dto.RegisterRequest;
import com.careermetric.auth.service.AuthService;
import com.careermetric.common.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        AuthResponse response = authService.register(request);

        return ApiResponse.success(
                "Registration successful",
                response
        );
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        AuthResponse response = authService.login(request);

        return ApiResponse.success(
                "Login successful",
                response
        );
    }

    @PostMapping("/google")
    public ApiResponse<AuthResponse> loginWithGoogle(
            @Valid @RequestBody GoogleLoginRequest request
    ) {
        AuthResponse response = authService.loginWithGoogle(request);

        return ApiResponse.success(
                "Google authentication successful",
                response
        );
    }
}