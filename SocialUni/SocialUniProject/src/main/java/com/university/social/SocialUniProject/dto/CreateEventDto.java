package com.university.social.SocialUniProject.dto;

import com.university.social.SocialUniProject.enums.Category;
import com.university.social.SocialUniProject.enums.EventPrivacy;
import com.university.social.SocialUniProject.enums.EventStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateEventDto {
    private String name;
    private String description;
    private LocalDateTime date;
    private String location;
    private Long groupId;
    private Category category;
    private EventPrivacy privacy;
    private EventStatus status = EventStatus.SCHEDULED; // Add default status
}