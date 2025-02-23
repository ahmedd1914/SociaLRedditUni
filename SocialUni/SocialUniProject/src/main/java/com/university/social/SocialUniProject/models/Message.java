package com.university.social.SocialUniProject.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
        name = "messages",
        indexes = {
                @Index(name = "idx_message_receiver", columnList = "receiver_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    // The user who sent the message
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    @ToString.Exclude
    private User sender;

    // For direct messages, the receiver is a User.
    // For group chats, receiver can be null and group is set.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = true)
    @ToString.Exclude
    private User receiver;

    // For group chat messages, this field is set.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = true)
    @ToString.Exclude
    private Group group;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private boolean isRead = false;

    private LocalDateTime sentAt;

    // When true, the message is deleted for everyone (hard deletion)
    private boolean deletedForAll = false;

    // Stores the IDs of users for whom this message has been soft-deleted.
    @ElementCollection
    @CollectionTable(name = "message_deleted_for", joinColumns = @JoinColumn(name = "message_id"))
    @Column(name = "user_id")
    private Set<Long> deletedFor = new HashSet<>();

    public Message(User sender, User receiver, String content) {
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
        this.sentAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (sentAt == null) {
            sentAt = LocalDateTime.now();
        }
    }
}
