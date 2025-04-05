package com.university.social.SocialUniProject.responses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GenericDeleteResponse {
    private boolean success;
    private String message;
} 