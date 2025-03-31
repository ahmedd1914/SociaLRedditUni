package com.university.social.SocialUniProject.dto.UserDto;

import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsersDto {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private String fName;
    private String lName;
    private boolean enabled;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private String imgUrl;
    private String phoneNumber;

    public static UsersDto fromEntity(User user) {
        return new UsersDto(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole(),
            user.getFName(),
            user.getLName(),
            user.isEnabled(),
            user.getLastLogin(),
            user.getCreatedAt(),
            user.getImgUrl(),
            user.getPhoneNumber()
        );
    }
}

