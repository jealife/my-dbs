package com.mydbs.backend.auth.service.impl;

import com.mydbs.backend.auth.dto.AuthResponse;
import com.mydbs.backend.auth.dto.LoginRequest;
import com.mydbs.backend.auth.security.CustomUserDetails;
import com.mydbs.backend.auth.security.JwtService;
import com.mydbs.backend.auth.service.AuthService;
import com.mydbs.backend.common.exception.InvalidCredentialsException;
import com.mydbs.backend.user.model.User;
import com.mydbs.backend.user.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           JwtService jwtService,
                           UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (Exception ex) {
            throw new InvalidCredentialsException("Email ou mot de passe invalide");
        }

        User user = userRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Email ou mot de passe invalide"));

        CustomUserDetails customUserDetails = new CustomUserDetails(user);
        String jwtToken = jwtService.generateToken(customUserDetails);

        AuthResponse response = new AuthResponse();
        response.setAccessToken(jwtToken);
        response.setTokenType("Bearer");
        response.setUserId(user.getId());
        response.setUserCode(user.getUserCode());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setStatus(user.getStatus());

        return response;
    }
}