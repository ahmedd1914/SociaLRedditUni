package com.university.social.SocialUniProject.dto.UserDto;

import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.enums.Role;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UsersDto {
    private Long id;
    private String username;
    private String email;
    private Role role; // User role (ADMIN, USER, MODERATOR, etc.)
    private boolean isBanned; // To track if the user is banned
    private LocalDateTime createdAt; // Account creation date
    private LocalDateTime lastLogin; // Last login timestamp

    public UsersDto(Long id, String username, String email, Role role, boolean isBanned, LocalDateTime createdAt, LocalDateTime lastLogin) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.isBanned = isBanned;
        this.createdAt = createdAt;
        this.lastLogin = lastLogin;
    }

    // ✅ Static factory method to convert a User entity to UserDto
    public static UsersDto fromEntity(User user) {
        return new UsersDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.isBanned(),
                user.getCreatedAt(),
                user.getLastLogin()
        );
    }
}

