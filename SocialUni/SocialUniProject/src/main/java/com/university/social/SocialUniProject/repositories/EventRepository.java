package com.university.social.SocialUniProject.repositories;

import com.university.social.SocialUniProject.enums.EventStatus;
import com.university.social.SocialUniProject.models.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByGroupIsNull(); // Public events
    List<Event> findByGroupId(Long groupId);
    List<Event> findByStatusAndDateBefore(EventStatus status, LocalDateTime now);
}
