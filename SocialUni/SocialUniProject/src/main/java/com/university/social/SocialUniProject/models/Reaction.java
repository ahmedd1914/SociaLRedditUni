package com.university.social.SocialUniProject.models;

import com.university.social.SocialUniProject.models.Enums.ReactionType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reactions",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "post_id"}),  // ✅ Unique reaction per post
                @UniqueConstraint(columnNames = {"user_id", "comment_id"}) // ✅ Unique reaction per comment
        })
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

    @Enumerated(EnumType.STRING) // ✅ Store as String in DB
    @Column(nullable = false)
    private ReactionType type;

    private LocalDateTime reactedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = true)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id", nullable = true)
    private Comment comment;



    public Reaction(ReactionType type, User user, Post post) {
        this.type = type;
        this.user = user;
        this.post = post;
    }
    public Reaction(ReactionType type, User user, Comment comment) {
        this.type = type;
        this.user = user;
        this.comment = comment;
    }

//    public Long getId() {
//        return id;
//    }
//
//    public void setId(Long id) {
//        this.id = id;
//    }
//
//    public ReactionType getType() {
//        return type;
//    }
//
//    public void setType(ReactionType type) {
//        this.type = type;
//    }
//
//    public LocalDateTime getReactedAt() {
//        return reactedAt;
//    }
//
//    public void setReactedAt(LocalDateTime reactedAt) {
//        this.reactedAt = reactedAt;
//    }
//
//    public User getUser() {
//        return user;
//    }
//
//    public void setUser(User user) {
//        this.user = user;
//    }
//
//    public Post getPost() {
//        return post;
//    }
//
//    public void setPost(Post post) {
//        this.post = post;
//    }
//
//    public Comment getComment() {
//        return comment;
//    }
//
//    public void setComment(Comment comment) {
//        this.comment = comment;
//    }

    @PrePersist
    protected void onCreate() {
        if (reactedAt == null) {
            reactedAt = LocalDateTime.now();
        }
    }
}
