package com.university.social.SocialUniProject.dto;

import com.university.social.SocialUniProject.enums.ActivityType;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
public class UserActivityDto {
    private Long id;                // Unique identifier for the activity (could be the entity's ID)
    private ActivityType type;      // Type of activity: POST, COMMENT, or GROUP
    private String title;           // Title or short description of the activity
    private String content;         // Optional detailed content
    private LocalDateTime createdAt;// When the activity occurred
    private Long entityId;          // The ID of the underlying entity (e.g., post, comment, or group)
}
