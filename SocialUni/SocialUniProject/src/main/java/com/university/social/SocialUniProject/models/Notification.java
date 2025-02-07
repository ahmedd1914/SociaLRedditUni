package com.university.social.SocialUniProject.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "notifications",
        indexes = {
                @Index(name = "idx_notification_recipient_isread", columnList = "recipient_id, isRead")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String message;          // e.g. "User X commented on your post"
    private String notificationType; // e.g. "COMMENT", "NEW_POST", etc.

    private LocalDateTime createdAt;

    private boolean isRead;

    // Recipient of this notification
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User recipient;

    // Optional references to related items
    private Long relatedPostId;
    private Long relatedCommentId;

    public Notification(String message, String notificationType, User recipient,
                        Long relatedPostId, Long relatedCommentId) {
        this.message = message;
        this.notificationType = notificationType;
        this.recipient = recipient;
        this.relatedPostId = relatedPostId;
        this.relatedCommentId = relatedCommentId;
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}