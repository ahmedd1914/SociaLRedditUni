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
    private boolean isBanned;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private String imgUrl;

    public UsersDto(Long id, String username, String email, Role role, boolean isBanned, LocalDateTime createdAt, LocalDateTime lastLogin, String imgUrl) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.isBanned = isBanned;
        this.createdAt = createdAt;
        this.lastLogin = lastLogin;
        this.imgUrl = imgUrl;
    }


    public static UsersDto fromEntity(User user) {
        return new UsersDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.isBanned(),
                user.getCreatedAt(),
                user.getLastLogin(),
                user.getImgUrl()
        );
    }
}

