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

    @Column(nullable = false)
    private String message;  // e.g. "User X commented on your post"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private NotificationType notificationType; // e.g. COMMENT, NEW_POST

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Column(name = "related_post_id")
    private Long relatedPostId;

    @Column(name = "related_comment_id")
    private Long relatedCommentId;

    @Column(nullable = false)
    private boolean isRead = false;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(columnDefinition = "json")
    private String metadata;

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
