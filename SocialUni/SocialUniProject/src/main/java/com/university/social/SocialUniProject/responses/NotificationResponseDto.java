package com.university.social.SocialUniProject.responses;

import com.university.social.SocialUniProject.enums.NotificationType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDto {
    private Long id;
    private String message;
    private NotificationType notificationType;
    private boolean isRead;
    private LocalDateTime createdAt;
    private Long relatedPostId;
    private Long relatedCommentId;
    private String metadata;
}