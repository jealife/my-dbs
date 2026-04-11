package com.mydbs.backend.bootstrap;

import com.mydbs.backend.user.model.User;
import com.mydbs.backend.user.model.UserRole;
import com.mydbs.backend.user.model.UserStatus;
import com.mydbs.backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AdminBootstrapRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin.email}")
    private String adminEmail;

    @Value("${app.bootstrap.admin.password}")
    private String adminPassword;

    @Value("${app.bootstrap.admin.first-name}")
    private String adminFirstName;

    @Value("${app.bootstrap.admin.last-name}")
    private String adminLastName;

    @Value("${app.bootstrap.admin.user-code}")
    private String adminUserCode;

    @Value("${app.bootstrap.admin.phone-number}")
    private String adminPhoneNumber;

    public AdminBootstrapRunner(UserRepository userRepository,
                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        Optional<User> existing = userRepository.findByEmail(adminEmail);
        if (existing.isPresent()) {
            User admin = existing.get();
            admin.setDeleted(false);
            admin.setUserCode(adminUserCode);
            admin.setFirstName(adminFirstName);
            admin.setLastName(adminLastName);
            admin.setPhoneNumber(adminPhoneNumber);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(UserRole.SUPER_ADMIN);
            admin.setStatus(UserStatus.ACTIVE);
            userRepository.save(admin);
            return;
        }

        User admin = new User();
        admin.setUserCode(adminUserCode);
        admin.setFirstName(adminFirstName);
        admin.setLastName(adminLastName);
        admin.setEmail(adminEmail);
        admin.setPhoneNumber(adminPhoneNumber);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(UserRole.SUPER_ADMIN);
        admin.setStatus(UserStatus.ACTIVE);

        userRepository.save(admin);
    }
}