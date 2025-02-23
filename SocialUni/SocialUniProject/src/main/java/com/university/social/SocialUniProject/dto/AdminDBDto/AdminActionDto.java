package com.university.social.SocialUniProject.dto.AdminDBDto;

import com.university.social.SocialUniProject.models.Enums.Role;
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