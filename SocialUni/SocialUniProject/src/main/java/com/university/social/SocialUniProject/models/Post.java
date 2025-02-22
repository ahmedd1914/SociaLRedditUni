package com.university.social.SocialUniProject.models;

import com.university.social.SocialUniProject.models.Enums.Category;
import com.university.social.SocialUniProject.models.Enums.Visibility;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String title;

    @NotBlank
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private Visibility visibility;

    // Many-to-One with User (author)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    @ToString.Exclude
    private User user;

    // If post belongs to a group
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    @ToString.Exclude
    private Group group;

    // Example of storing categories as an Enum set
    @ElementCollection(targetClass = Category.class)
    @CollectionTable(name = "post_categories", joinColumns = @JoinColumn(name = "post_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    @ToString.Exclude
    private Set<Category> categories = new HashSet<>();

    // One-to-Many with Comment
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private Set<Comment> comments = new HashSet<>();

    // One-to-Many with Reaction
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private Set<Reaction> reactions = new HashSet<>();

    // Convenience constructor
    public Post(String title, String content, User user, Group group) {
        this.title = title;
        this.content = content;
        this.user = user;
        this.group = group;
        this.createdAt = LocalDateTime.now();
    }

//    public Post() {
//    }

    // If using a no-arg constructor, you can set createdAt in it
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
//    public String getTitle() {
//        return title;
//    }
//
//    public void setTitle(String title) {
//        this.title = title;
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
//    public LocalDateTime getCreatedAt() {
//        return createdAt;
//    }
//
//    public void setCreatedAt(LocalDateTime createdAt) {
//        this.createdAt = createdAt;
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
//    public User getUser() {
//        return user;
//    }
//
//    public void setUser(User user) {
//        this.user = user;
//    }
//
//    public Group getGroup() {
//        return group;
//    }
//
//    public void setGroup(Group group) {
//        this.group = group;
//    }
//
//    public Set<Category> getCategories() {
//        return categories;
//    }
//
//    public void setCategories(Set<Category> categories) {
//        this.categories = categories;
//    }
//
//    public Set<Comment> getComments() {
//        return comments;
//    }
//
//    public void setComments(Set<Comment> comments) {
//        this.comments = comments;
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