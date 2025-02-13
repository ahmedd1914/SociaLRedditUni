package com.university.social.SocialUniProject.repositories;

import com.university.social.SocialUniProject.models.Notification;
import com.university.social.SocialUniProject.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Get unread notifications for a specific user
    List<Notification> findByRecipientAndIsReadFalse(User recipient);

    // Get all notifications for a user, ordered by creation date
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
}
