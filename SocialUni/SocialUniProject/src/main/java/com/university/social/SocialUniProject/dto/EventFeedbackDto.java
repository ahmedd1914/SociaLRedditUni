package com.university.social.SocialUniProject.dto;

import lombok.Data;

@Data
public class EventFeedbackDto {
    private Long eventId;
    private Long userId;
    private Integer rating; // e.g., 1-5 stars
    private String comment;
}
