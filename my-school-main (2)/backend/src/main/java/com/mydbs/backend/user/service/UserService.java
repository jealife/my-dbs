package com.mydbs.backend.user.service;

import com.mydbs.backend.user.dto.UserCreateRequest;
import com.mydbs.backend.user.dto.UserResponse;
import com.mydbs.backend.user.dto.UserUpdateRequest;

import java.util.List;

public interface UserService {

    UserResponse createUser(UserCreateRequest request);

    List<UserResponse> getAllUsers();
    List<UserResponse> getUsersByRole(String role);

    UserResponse getUserById(Long id);

    List<UserResponse> searchUsers(String keyword);

    UserResponse updateUser(Long id, UserUpdateRequest request);

    void deleteUser(Long id);

    UserResponse updatePhoto(Long id, String photoUrl);
}