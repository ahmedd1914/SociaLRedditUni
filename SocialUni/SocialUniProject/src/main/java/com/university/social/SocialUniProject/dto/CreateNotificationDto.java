package com.university.social.SocialUniProject.dto;

import com.university.social.SocialUniProject.enums.NotificationType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateNotificationDto {
    private String message;
    private NotificationType notificationType;
    private Long recipientId;
    private Long relatedPostId;
    private Long relatedCommentId;
    private String metadata;

    public CreateNotificationDto(String message, NotificationType notificationType, Long id, Long postId, Long commentId) {
        this.message = message;
        this.notificationType = notificationType;
        this.recipientId = id;
        this.relatedPostId = postId;
        this.relatedCommentId = commentId;
    }


//    public String getMessage() {
//        return message;
//    }
//
//    public void setMessage(String message) {
//        this.message = message;
//    }
//
//    public NotificationType getNotificationType() {
//        return notificationType;
//    }
//
//    public void setNotificationType(NotificationType notificationType) {
//        this.notificationType = notificationType;
//    }
//
//    public Long getRecipientId() {
//        return recipientId;
//    }
//
//    public void setRecipientId(Long recipientId) {
//        this.recipientId = recipientId;
//    }
//
//    public Long getRelatedPostId() {
//        return relatedPostId;
//    }
//
//    public void setRelatedPostId(Long relatedPostId) {
//        this.relatedPostId = relatedPostId;
//    }
//
//    public Long getRelatedCommentId() {
//        return relatedCommentId;
//    }
//
//    public void setRelatedCommentId(Long relatedCommentId) {
//        this.relatedCommentId = relatedCommentId;
//    }
}