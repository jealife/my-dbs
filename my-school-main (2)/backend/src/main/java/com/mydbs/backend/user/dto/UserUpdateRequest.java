package com.mydbs.backend.user.dto;

import com.mydbs.backend.user.model.UserRole;
import com.mydbs.backend.user.model.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UserUpdateRequest {

    @NotBlank(message = "Le prenom est obligatoire")
    @Size(max = 100, message = "Le prenom ne doit pas depasser 100 caracteres")
    private String firstName;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100, message = "Le nom ne doit pas depasser 100 caracteres")
    private String lastName;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    @Size(max = 150, message = "L'email ne doit pas depasser 150 caracteres")
    private String email;

    @Size(max = 30, message = "Le numero de telephone ne doit pas depasser 30 caracteres")
    private String phoneNumber;

    @NotNull(message = "Le role est obligatoire")
    private UserRole role;

    @NotNull(message = "Le statut est obligatoire")
    private UserStatus status;

    public UserUpdateRequest() {
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }
}