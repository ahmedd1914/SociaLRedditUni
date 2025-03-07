package com.university.social.SocialUniProject.responses;

import com.university.social.SocialUniProject.enums.Category;
import com.university.social.SocialUniProject.enums.EventStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class EventResponseDto {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime date;
    private String location;
    private Long organizerId;
    private Long groupId; // Optional, if the event belongs to a group
    private Category category;
    private EventStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}