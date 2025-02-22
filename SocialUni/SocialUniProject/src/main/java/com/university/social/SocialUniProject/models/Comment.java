package com.university.social.SocialUniProject.models;

import com.university.social.SocialUniProject.models.Enums.Visibility;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "media_url")
    private String mediaUrl; // Supports images, videos, links

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Visibility visibility = Visibility.PUBLIC; // Default visibility

    private LocalDateTime createdAt;


    // Many-to-One with User (Author of the Comment)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    @ToString.Exclude
    private User user;

    // Many-to-One with Post (If comment is on a post)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    @ToString.Exclude
    private Post post;

    // Optional: For Nested Replies
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    @ToString.Exclude
    private Comment parentComment;

    // Many-to-Many with User for Reactions
    @ManyToMany
    @JoinTable(
            name = "comment_reactions",
            joinColumns = @JoinColumn(name = "comment_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @ToString.Exclude
    private Set<User> reactedUsers = new HashSet<>();

    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private Set<Reaction> reactions = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    // Admin can mark comments as deleted instead of fully removing them
    private boolean isDeleted = false;

    // Convenience constructor
    public Comment(String content, User user, Post post, Visibility visibility, String mediaUrl) {
        this.content = content;
        this.user = user;
        this.post = post;
        this.visibility = visibility;
        this.mediaUrl = mediaUrl;
        this.createdAt = LocalDateTime.now();
    }

//    public Comment() {
//    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

//    public Long getId() {
//        return id;
//    }
//
//    public void setId(Long id) {
//        this.id = id;
//    }
//
//    public String getContent() {
//        return content;
//    }
//
//    public void setContent(String content) {
//        this.content = content;
//    }
//
//    public String getMediaUrl() {
//        return mediaUrl;
//    }
//
//    public void setMediaUrl(String mediaUrl) {
//        this.mediaUrl = mediaUrl;
//    }
//
//    public Visibility getVisibility() {
//        return visibility;
//    }
//
//    public void setVisibility(Visibility visibility) {
//        this.visibility = visibility;
//    }
//
//    public LocalDateTime getCreatedAt() {
//        return createdAt;
//    }
//
//    public void setCreatedAt(LocalDateTime createdAt) {
//        this.createdAt = createdAt;
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
//    public Comment getParentComment() {
//        return parentComment;
//    }
//
//    public void setParentComment(Comment parentComment) {
//        this.parentComment = parentComment;
//    }
//
//    public Set<User> getReactedUsers() {
//        return reactedUsers;
//    }
//
//    public void setReactedUsers(Set<User> reactedUsers) {
//        this.reactedUsers = reactedUsers;
//    }
//
//    public boolean isDeleted() {
//        return isDeleted;
//    }
//
//    public void setDeleted(boolean deleted) {
//        isDeleted = deleted;
//    }
//
//    public Set<Reaction> getReactions() {
//        return reactions;
//    }
//
//    public void setReactions(Set<Reaction> reactions) {
//        this.reactions = reactions;
//    }
}
