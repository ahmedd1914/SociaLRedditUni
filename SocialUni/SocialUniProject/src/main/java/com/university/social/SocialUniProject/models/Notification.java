package com.university.social.SocialUniProject.models;

import com.university.social.SocialUniProject.enums.NotificationType;
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
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = "recipient")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String message;  // e.g. "User X commented on your post"

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false, length = 100)
    private NotificationType notificationType; // e.g. COMMENT, NEW_POST

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private boolean isRead = false;

    // Recipient of this notification
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_notification_recipient"))
    private User recipient;

    // Optional references to related items
    private Long relatedPostId;
    private Long relatedCommentId;

    // Optional convenience constructor (if needed)
    public Notification(String message, NotificationType notificationType, User recipient,
                        Long relatedPostId, Long relatedCommentId) {
        this.message = message;
        this.notificationType = notificationType;
        this.recipient = recipient;
        this.relatedPostId = relatedPostId;
        this.relatedCommentId = relatedCommentId;
    }
}
