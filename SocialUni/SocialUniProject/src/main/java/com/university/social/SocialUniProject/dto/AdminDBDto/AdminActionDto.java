package com.university.social.SocialUniProject.dto;

import com.university.social.SocialUniProject.models.Enums.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminActionDto {
    private Long userId;
    private Role newRole;
}