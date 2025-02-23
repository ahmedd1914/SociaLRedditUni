package com.university.social.SocialUniProject.models;

import com.university.social.SocialUniProject.models.Enums.Category;
import com.university.social.SocialUniProject.models.Enums.Visibility;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "social_group")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @Size(max = 500)
    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private Visibility visibility;
    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false) // This maps the owner to a User
    private User owner;
    @ManyToMany
    @JoinTable(
            name = "group_users",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @ToString.Exclude
    private Set<User> members = new HashSet<>(); // ✅ Always initialized

    @ManyToMany
    @JoinTable(
            name = "group_admins",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "admin_id")
    )
    private Set<User> admins = new HashSet<>(); // ✅ Always initialized

    @ManyToMany
    @JoinTable(
            name = "group_join_requests",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> joinRequests = new HashSet<>(); // ✅ Always initialized

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private Set<Post> posts = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

//    public Group(String name, String description, Visibility visibility, Category category) {
//        this.name = name;
//        this.description = description;
//        this.visibility = visibility;
//        this.category = category;
//        this.members = new HashSet<>();
//        this.admins = new HashSet<>();
//        this.joinRequests = new HashSet<>();
//        this.posts = new HashSet<>();
//    }

//    public Group() {
//    }
//
//    public Long getId() {
//        return id;
//    }
//
//    public void setId(Long id) {
//        this.id = id;
//    }
//
//    public @NotBlank @Size(max = 100) String getName() {
//        return name;
//    }
//
//    public void setName(@NotBlank @Size(max = 100) String name) {
//        this.name = name;
//    }
//
//    public @Size(max = 500) String getDescription() {
//        return description;
//    }
//
//    public void setDescription(@Size(max = 500) String description) {
//        this.description = description;
//    }
//
//    public boolean isPrivate() {
//        return isPrivate;
//    }
//
//    public void setPrivate(boolean aPrivate) {
//        isPrivate = aPrivate;
//    }
//
//    public Set<User> getMembers() {
//        return members;
//    }
//
//    public void setMembers(Set<User> members) {
//        this.members = members;
//    }
//
//    public Set<User> getAdmins() {
//        return admins;
//    }
//
//    public void setAdmins(Set<User> admins) {
//        this.admins = admins;
//    }
//
//    public Set<User> getJoinRequests() {
//        return joinRequests;
//    }
//
//    public void setJoinRequests(Set<User> joinRequests) {
//        this.joinRequests = joinRequests;
//    }
//
//    public Set<Post> getPosts() {
//        return posts;
//    }
//
//    public void setPosts(Set<Post> posts) {
//        this.posts = posts;
//    }
//
//    public Category getCategory() {
//        return category;
//    }
//
//    public void setCategory(Category category) {
//        this.category = category;
//    }
}
