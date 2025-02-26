package com.university.social.SocialUniProject.models;

import com.university.social.SocialUniProject.enums.Category;
import com.university.social.SocialUniProject.enums.EventPrivacy;
import com.university.social.SocialUniProject.enums.EventStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime date;

    private String location;

    // The creator/organizer of the event
    @ManyToOne
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    // Users who have permission to edit the event besides the organizer
    @ManyToMany
    @JoinTable(name = "event_redactors",
            joinColumns = @JoinColumn(name = "event_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<User> redactors;

    // RSVP fields – who will attend
    @ManyToMany
    @JoinTable(name = "event_will_attend",
            joinColumns = @JoinColumn(name = "event_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<User> willAttend;

    // RSVP fields – who will not attend
    @ManyToMany
    @JoinTable(name = "event_will_not_attend",
            joinColumns = @JoinColumn(name = "event_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<User> willNotAttend;

    @ManyToMany
    @JoinTable(name = "event_maybe_attend",
            joinColumns = @JoinColumn(name = "event_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<User> maybeAttend;

    // Comments on the event
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Comment> comments;

    // If the event is part of a group (optional)
    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;

    @Enumerated(EnumType.STRING)
    private Category category;

    @Enumerated(EnumType.STRING)
    private EventStatus status;
    @Enumerated(EnumType.STRING)
    private EventPrivacy privacy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
