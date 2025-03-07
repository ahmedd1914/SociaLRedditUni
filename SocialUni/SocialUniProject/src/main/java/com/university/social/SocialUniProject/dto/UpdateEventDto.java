package com.university.social.SocialUniProject.dto;

import com.university.social.SocialUniProject.enums.Category;
import com.university.social.SocialUniProject.enums.EventPrivacy;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateEventDto {
    private String name;
    private String description;
    private LocalDateTime date;
    private String location;
    private Category category;
    // Optionally, allow changing status
    private String status;
    private EventPrivacy privacy;
}