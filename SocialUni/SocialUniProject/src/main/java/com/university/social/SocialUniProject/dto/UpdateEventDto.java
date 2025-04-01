package com.university.social.SocialUniProject.dto;

import com.university.social.SocialUniProject.enums.Category;
import com.university.social.SocialUniProject.enums.EventPrivacy;
import com.university.social.SocialUniProject.enums.EventStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateEventDto {
    private String name;
    private String description;
    private LocalDateTime date;
    private String location;
    private Category category;
    private EventStatus status;
    private EventPrivacy privacy;
    private Long groupId;
}