package com.university.social.SocialUniProject.models;
//
//import jakarta.persistence.*;
//import jakarta.validation.constraints.Email;
//import jakarta.validation.constraints.NotBlank;
//import jakarta.validation.constraints.Size;
//import lombok.*;
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.userdetails.UserDetails;
//
//import java.time.LocalDateTime;
//import java.util.Collection;
//import java.util.HashSet;
//import java.util.List;
//import java.util.Set;
//
//@Entity
//@Table(name = "users")
//@NoArgsConstructor
//@AllArgsConstructor
//@EqualsAndHashCode(onlyExplicitlyIncluded = true)
//@ToString
//public class User implements UserDetails {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    @EqualsAndHashCode.Include
//    private Long id;
//
//    @NotBlank
//    @Size(max = 50)
//    @Column(nullable = false, unique = true, length = 50)
//    private String username;
//
//    @NotBlank
//    @Email
//    @Size(max = 100)
//    @Column(nullable = false, unique = true, length = 100)
//    private String email;
//
//    @Size(max = 100)
//    private String fullName;
//
//    // Ensure you hash the password before saving (not shown here, but do so in your Service layer)
//    @NotBlank
//    @Size(max = 255)
//    @Column(nullable = false)
//    private String password; // Remember to hash passwords before saving
//
//
//    @Column(name = "verification_code")
//    private String verificationCode;
//    @Column(name = "verification_expiration")
//    private LocalDateTime verificationCodeExpiresAt;
//    private boolean enabled;
//    // A user can join many groups
//    @ManyToMany(mappedBy = "members")
//    @ToString.Exclude
//    @EqualsAndHashCode.Exclude
//    private Set<Group> groups = new HashSet<>();
//
//    // A user can author many posts
//    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
//    @ToString.Exclude
//    @EqualsAndHashCode.Exclude
//    private Set<Post> posts = new HashSet<>();
//
//    // Convenience constructor without ID
//    public User(String username, String email, String fullName, String password) {
//        this.username = username;
//        this.email = email;
//        this.fullName = fullName;
//        this.password = password;
//    }
//
//
//}
import com.university.social.SocialUniProject.models.Enums.Role;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @Getter
    @Column(unique = true, nullable = false)
    private String username;
    @Getter
    @Column(unique = true, nullable = false)
    private String email;
    @Getter
    @Column(nullable = false)
    private String password;
    @Enumerated(EnumType.STRING)
    private Role role;
    @Setter
    @Getter
    @Column(name = "verification_code")
    private String verificationCode;
    @Setter
    @Getter
    @Column(name = "verification_expiration")
    private LocalDateTime verificationCodeExpiresAt;
    @Setter
    private boolean enabled;
        // A user can join many groups
    @ManyToMany(mappedBy = "members")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Group> groups = new HashSet<>();


    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Post> posts = new HashSet<>();

    //constructor for creating an unverified user
    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    //default constructor
    public User(){
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    //TODO: add proper boolean checks
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

    public LocalDateTime getVerificationCodeExpiresAt() {
        return verificationCodeExpiresAt;
    }

    public void setVerificationCodeExpiresAt(LocalDateTime verificationCodeExpiresAt) {
        this.verificationCodeExpiresAt = verificationCodeExpiresAt;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public Set<Group> getGroups() {
        return groups;
    }

    public void setGroups(Set<Group> groups) {
        this.groups = groups;
    }

    public Set<Post> getPosts() {
        return posts;
    }

    public void setPosts(Set<Post> posts) {
        this.posts = posts;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}