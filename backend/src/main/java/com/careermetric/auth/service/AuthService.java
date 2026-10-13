package com.careermetric.auth.service;

import com.careermetric.auth.dto.AuthResponse;
import com.careermetric.auth.dto.GoogleLoginRequest;
import com.careermetric.auth.dto.LoginRequest;
import com.careermetric.auth.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse loginWithGoogle(GoogleLoginRequest request);
}