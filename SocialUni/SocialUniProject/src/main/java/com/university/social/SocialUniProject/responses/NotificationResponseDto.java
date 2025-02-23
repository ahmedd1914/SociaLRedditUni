package com.university.social.SocialUniProject.responses;


import com.university.social.SocialUniProject.models.Enums.NotificationType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class NotificationResponseDto {
    private Long id;
    private String message;
    private NotificationType notificationType;
    private boolean isRead;
    private LocalDateTime createdAt;
    private Long relatedPostId;
    private Long relatedCommentId;


}