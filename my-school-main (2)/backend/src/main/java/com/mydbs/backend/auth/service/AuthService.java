package com.mydbs.backend.auth.service;

import com.mydbs.backend.auth.dto.AuthResponse;
import com.mydbs.backend.auth.dto.LoginRequest;

public interface AuthService {

    AuthResponse login(LoginRequest request);
}