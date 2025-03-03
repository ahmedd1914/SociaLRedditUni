package com.university.social.SocialUniProject.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateUserDto {
    private String username;
    private String email;
    private String password;
    // Optional profile fields
    private String FName;
    private String LName;
    private String phoneNumber;
}