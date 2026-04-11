package com.mydbs.backend.user.dto;

import com.mydbs.backend.user.model.User;
import com.mydbs.backend.user.model.UserRole;

/**
 * Version allégée de l'utilisateur pour l'affichage publique/GED.
 */
public record UserSummaryDTO(
        Long id,
        String firstName,
        String lastName,
        String photoUrl,
        UserRole role
) {
    public static UserSummaryDTO fromEntity(User user) {
        if (user == null) return null;
        return new UserSummaryDTO(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhotoUrl(),
                user.getRole()
        );
    }
}
