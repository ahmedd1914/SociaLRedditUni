package com.university.social.SocialUniProject.responses;

import com.university.social.SocialUniProject.enums.Role;
import com.university.social.SocialUniProject.models.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserResponseDto {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private boolean enabled;
    private LocalDateTime lastLogin;
    private String FName;
    private String LName;
    private String phoneNumber;
    private String imgUrl;
    private LocalDateTime createdAt;

    public static UserResponseDto fromEntity(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setEnabled(user.isEnabled());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setLastLogin(user.getLastLogin());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setImgUrl(user.getImgUrl());
        dto.setFName(user.getFName());
        dto.setLName(user.getLName());
        return dto;
    }
}
