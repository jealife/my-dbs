package com.mydbs.backend.user.service.impl;

import com.mydbs.backend.common.exception.DuplicateResourceException;
import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.user.dto.UserCreateRequest;
import com.mydbs.backend.user.dto.UserResponse;
import com.mydbs.backend.user.dto.UserUpdateRequest;
import com.mydbs.backend.user.model.User;
import com.mydbs.backend.user.model.UserStatus;
import com.mydbs.backend.user.repository.UserRepository;
import com.mydbs.backend.user.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.mydbs.backend.student.repository.StudentRepository studentRepository;
    private final com.mydbs.backend.teacher.repository.TeacherRepository teacherRepository;

    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           com.mydbs.backend.student.repository.StudentRepository studentRepository,
                           com.mydbs.backend.teacher.repository.TeacherRepository teacherRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
    }

    @Override
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByEmailAndDeletedFalse(request.getEmail())) {
            throw new DuplicateResourceException("Un utilisateur avec cet email existe deja");
        }

        if (userRepository.existsByUserCodeAndDeletedFalse(request.getUserCode())) {
            throw new DuplicateResourceException("Un utilisateur avec ce code existe deja");
        }

        User user = new User();
        user.setUserCode(request.getUserCode());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setStatus(request.getStatus() != null ? request.getStatus() : UserStatus.ACTIVE);

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findByDeletedFalse()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> getUsersByRole(String role) {
        if (role == null || role.trim().isEmpty() || "ALL".equalsIgnoreCase(role)) {
            return getAllUsers();
        }

        try {
            com.mydbs.backend.user.model.UserRole userRole = com.mydbs.backend.user.model.UserRole.valueOf(role.toUpperCase());
            return userRepository.findByRoleAndDeletedFalse(userRole)
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = findActiveUser(id);
        return mapToResponse(user);
    }

    @Override
    public List<UserResponse> searchUsers(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllUsers();
        }

        return userRepository
                .findByFirstNameContainingIgnoreCaseAndDeletedFalseOrLastNameContainingIgnoreCaseAndDeletedFalse(
                        keyword, keyword
                )
                .stream()
                .filter(user -> !user.isDeleted())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = findActiveUser(id);

        userRepository.findByEmailAndDeletedFalse(request.getEmail())
                .ifPresent(existingUser -> {
                    if (!existingUser.getId().equals(id)) {
                        throw new DuplicateResourceException("Un autre utilisateur utilise deja cet email");
                    }
                });

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(request.getRole());
        user.setStatus(request.getStatus());

        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    @Override
    public UserResponse updatePhoto(Long id, String photoUrl) {
        User user = findActiveUser(id);
        user.setPhotoUrl(photoUrl);
        User saved = userRepository.save(user);

        // Sync with related profiles
        studentRepository.findByUserId(id).ifPresent(student -> {
            student.setPhotoUrl(photoUrl);
            studentRepository.save(student);
        });

        teacherRepository.findByUserId(id).ifPresent(teacher -> {
            teacher.setPhotoUrl(photoUrl);
            teacherRepository.save(teacher);
        });

        return mapToResponse(saved);
    }

    @Override
    public void deleteUser(Long id) {
        User user = findActiveUser(id);
        user.setDeleted(true);
        user.setStatus(UserStatus.ARCHIVED);
        userRepository.save(user);
    }

    private User findActiveUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'id : " + id));

        if (user.isDeleted()) {
            throw new ResourceNotFoundException("Utilisateur introuvable avec l'id : " + id);
        }

        return user;
    }

    private UserResponse mapToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUserCode(user.getUserCode());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setRole(user.getRole());
        response.setStatus(user.getStatus());
        response.setPhotoUrl(user.getPhotoUrl());
        response.setBio(user.getBio());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}