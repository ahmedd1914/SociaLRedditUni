package com.university.social.SocialUniProject.dto;

import com.university.social.SocialUniProject.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminActionDto {
    @NotNull(message = "User cannot be null")
    private Long userId;
    @NotNull(message = "Role cannot be null")
    private Role newRole;
}