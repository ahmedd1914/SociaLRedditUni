package com.university.social.SocialUniProject.repositories;

import com.university.social.SocialUniProject.models.Notification;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Get unread notifications for a specific user
    List<Notification> findByRecipientAndIsReadFalse(User recipient);

    // Get all notifications for a user, ordered by creation date
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);

    Page<Notification> findByRecipientOrderByCreatedAtDesc(User recipient, Pageable pageable);

    long countByIsReadFalse();
    long countByCreatedAtAfter(LocalDateTime date);

    List<Notification> findByCreatedAtBeforeAndIsReadTrue(LocalDateTime date);

    @Query("SELECT n FROM Notification n WHERE n.recipient = :recipient AND " +
           "(:type IS NULL OR n.notificationType = :type) AND " +
           "(:isRead IS NULL OR n.isRead = :isRead) AND " +
           "(:startDate IS NULL OR n.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR n.createdAt <= :endDate) AND " +
           "(:searchTerm IS NULL OR LOWER(n.message) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "(:category IS NULL OR :category = 'ALL' OR CAST(n.notificationType AS string) LIKE CONCAT(:category, '%'))")
    Page<Notification> findFilteredNotifications(
            @Param("recipient") User recipient,
            @Param("type") NotificationType type,
            @Param("isRead") Boolean isRead,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("searchTerm") String searchTerm,
            @Param("category") String category,
            Pageable pageable);
}
