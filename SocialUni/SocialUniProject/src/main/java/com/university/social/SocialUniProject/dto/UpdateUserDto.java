package com.university.social.SocialUniProject.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Data
public class UpdateUserDto {
    private String FName;
    private String LName;
    private String username;
    private String email;
    private String phoneNumber;
    private String imgUrl;

}


