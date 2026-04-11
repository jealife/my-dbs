package com.mydbs.backend.auth.security;

import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.user.model.User;
import com.mydbs.backend.user.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) {
        User user = userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'email : " + email));

        return new CustomUserDetails(user);
    }
}