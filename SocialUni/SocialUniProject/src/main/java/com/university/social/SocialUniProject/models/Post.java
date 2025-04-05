package com.university.social.SocialUniProject.models;

import com.university.social.SocialUniProject.enums.Category;
import com.university.social.SocialUniProject.enums.Visibility;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"user", "group", "comments", "reactions"})
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

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private Visibility visibility;

    // Many-to-One with User (author)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // If post belongs to a group
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private Group group;


    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private Category categories;

    // One-to-Many with Comment
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Comment> comments = new HashSet<>();

    // One-to-Many with Reaction
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Reaction> reactions = new HashSet<>();

    /**
     * Calculate the trending score for this post based on Reddit's algorithm
     * @param now Current time for relative calculations
     * @return The calculated trending score
     */
    public double calculateTrendingScore(LocalDateTime now) {
        // Base score from reactions and comments
        int baseScore = this.reactions.size() + this.comments.size();
        
        // Post Velocity - How quickly a post is gaining engagement
        double velocityScore = 0;
        LocalDateTime oneDayAgo = now.minusHours(24);
        
        if (this.createdAt.isAfter(oneDayAgo)) {
            long hoursSinceCreation = java.time.Duration.between(this.createdAt, now).toHours();
            if (hoursSinceCreation > 0) {
                velocityScore = baseScore / (double) hoursSinceCreation;
            } else {
                velocityScore = baseScore; // If less than an hour old
            }
        }
        
        // Engagement Surge - Sudden spikes in recent activity
        LocalDateTime sixHoursAgo = now.minusHours(6);
        int recentReactions = (int) this.reactions.stream()
                .filter(r -> r.getPost().getCreatedAt().isAfter(sixHoursAgo))
                .count();
        
        int recentComments = (int) this.comments.stream()
                .filter(c -> c.getPost().getCreatedAt().isAfter(sixHoursAgo))
                .count();
        
        double surgeScore = (recentReactions + recentComments) * 2.0;
        
        // Time Decay - Reddit's algorithm uses a time decay factor
        long hoursSinceCreation = java.time.Duration.between(this.createdAt, now).toHours();
        double timeDecay = Math.pow(hoursSinceCreation + 2, 1.8); // Reddit's time decay formula
        
        // Combine scores with weights (similar to Reddit's algorithm)
        return (baseScore + (velocityScore * 1.5) + (surgeScore * 2.0)) / timeDecay;
    }
    
    /**
     * Get the number of recent reactions (within the last 6 hours)
     * @param now Current time for relative calculations
     * @return Count of recent reactions
     */
    public int getRecentReactionCount(LocalDateTime now) {
        LocalDateTime sixHoursAgo = now.minusHours(6);
        return (int) this.reactions.stream()
                .filter(r -> r.getPost().getCreatedAt().isAfter(sixHoursAgo))
                .count();
    }
    
    /**
     * Get the number of recent comments (within the last 6 hours)
     * @param now Current time for relative calculations
     * @return Count of recent comments
     */
    public int getRecentCommentCount(LocalDateTime now) {
        LocalDateTime sixHoursAgo = now.minusHours(6);
        return (int) this.comments.stream()
                .filter(c -> c.getPost().getCreatedAt().isAfter(sixHoursAgo))
                .count();
    }
    
    /**
     * Calculate the time decay factor for this post (Reddit's algorithm)
     * @param now Current time for relative calculations
     * @return The time decay factor
     */
    public double calculateTimeDecay(LocalDateTime now) {
        long hoursSinceCreation = java.time.Duration.between(this.createdAt, now).toHours();
        return Math.pow(hoursSinceCreation + 2, 1.8); // Reddit's time decay formula
    }
}
