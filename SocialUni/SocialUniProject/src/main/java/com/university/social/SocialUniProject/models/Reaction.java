package com.university.social.SocialUniProject.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "reactions",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "post_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class Reaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    // If you want various reaction types, store them here (e.g. "LIKE", "LOVE")
    private String type;

    private LocalDateTime reactedAt;

    // Many-to-One with User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    // Many-to-One with Post
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Post post;

    public Reaction(String type, User user, Post post) {
        this.type = type;
        this.user = user;
        this.post = post;

    }

    @PrePersist
    protected void onCreate() {
        if (reactedAt == null) {
            reactedAt = LocalDateTime.now();
        }
    }
}