package com.university.social.SocialUniProject.models;

import com.university.social.SocialUniProject.models.Enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
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

    private String message;  // e.g. "User X commented on your post"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType notificationType; // e.g. COMMENT, NEW_POST

    @CreationTimestamp
    private LocalDateTime createdAt;

    private boolean isRead = false;

    // Recipient of this notification
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_notification_recipient"))
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User recipient;

    // Optional references to related items
    private Long relatedPostId;
    private Long relatedCommentId;

    public Notification(String message, NotificationType notificationType, User recipient,
                        Long relatedPostId, Long relatedCommentId) {
        this.message = message;
        this.notificationType = notificationType;
        this.recipient = recipient;
        this.relatedPostId = relatedPostId;
        this.relatedCommentId = relatedCommentId;
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public NotificationType getNotificationType() {
        return notificationType;
    }

    public void setNotificationType(NotificationType notificationType) {
        this.notificationType = notificationType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public User getRecipient() {
        return recipient;
    }

    public void setRecipient(User recipient) {
        this.recipient = recipient;
    }

    public Long getRelatedPostId() {
        return relatedPostId;
    }

    public void setRelatedPostId(Long relatedPostId) {
        this.relatedPostId = relatedPostId;
    }

    public Long getRelatedCommentId() {
        return relatedCommentId;
    }

    public void setRelatedCommentId(Long relatedCommentId) {
        this.relatedCommentId = relatedCommentId;
    }
}
