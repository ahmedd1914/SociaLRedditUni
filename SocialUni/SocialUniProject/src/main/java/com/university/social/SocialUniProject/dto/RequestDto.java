package com.university.social.SocialUniProject.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestDto {
    private Long id;
    private String username;
    private String email;

    public RequestDto(Long id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }
}
