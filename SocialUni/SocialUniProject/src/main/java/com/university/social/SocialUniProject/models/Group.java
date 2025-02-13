package com.university.social.SocialUniProject.models;

import com.university.social.SocialUniProject.models.Enums.Category;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "groups")
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

    private boolean isPrivate = false;

    @ManyToMany
    @JoinTable(
            name = "group_users",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
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
    @EqualsAndHashCode.Exclude
    private Set<Post> posts = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    public Group(String name, String description, boolean isPrivate, Category category) {
        this.name = name;
        this.description = description;
        this.isPrivate = isPrivate;
        this.category = category;
        this.members = new HashSet<>();
        this.admins = new HashSet<>();
        this.joinRequests = new HashSet<>();
        this.posts = new HashSet<>();
    }
}
