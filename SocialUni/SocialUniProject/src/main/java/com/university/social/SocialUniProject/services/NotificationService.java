package com.university.social.SocialUniProject.services;


import com.university.social.SocialUniProject.dto.CreateNotificationDto;


import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.university.social.SocialUniProject.models.Notification;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.repositories.NotificationRepository;
import com.university.social.SocialUniProject.repositories.UserRepository;
import com.university.social.SocialUniProject.responses.NotificationResponseDto;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // Create and save a new notification
    public NotificationResponseDto createNotification(CreateNotificationDto dto) {
        Optional<User> recipientOpt = userRepository.findById(dto.getRecipientId());
        if (recipientOpt.isEmpty()) {
            throw new IllegalArgumentException("Recipient not found");
        }

        User recipient = recipientOpt.get();
        Notification notification = new Notification(
                dto.getMessage(),
                dto.getNotificationType(),
                recipient,
                dto.getRelatedPostId(),
                dto.getRelatedCommentId()
        );

        notificationRepository.save(notification);
        return mapToDto(notification);
    }

    // Get all notifications for a user
    public List<NotificationResponseDto> getUserNotifications(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        List<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(userOpt.get());
        return notifications.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    // Get unread notifications for a user
    public List<NotificationResponseDto> getUnreadNotifications(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        List<Notification> notifications = notificationRepository.findByRecipientAndIsReadFalse(userOpt.get());
        return notifications.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    // Mark a notification as read
    public void markNotificationAsRead(Long notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    // Admin: Get all notifications with optional filtering & pagination
    public List<NotificationResponseDto> getAllNotifications(String search,
                                                             Long recipientId,
                                                             Boolean isRead,
                                                             String type,
                                                             int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        // For simplicity, we fetch all notifications and filter in-memory.
        // In production you’d likely add custom repository queries.
        List<Notification> notifications = notificationRepository.findAll(pageable).getContent();

        return notifications.stream()
                .filter(n -> search == null || n.getMessage().toLowerCase().contains(search.toLowerCase()))
                .filter(n -> recipientId == null || n.getRecipient().getId().equals(recipientId))
                .filter(n -> isRead == null || n.isRead() == isRead)
                .filter(n -> type == null || n.getNotificationType().name().equalsIgnoreCase(type))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Admin: Bulk mark notifications as read
    public void bulkMarkAsRead(List<Long> notificationIds) {
        List<Notification> notifications = notificationRepository.findAllById(notificationIds);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    // Admin: Bulk delete notifications
    public void bulkDeleteNotifications(List<Long> notificationIds) {
        List<Notification> notifications = notificationRepository.findAllById(notificationIds);
        notificationRepository.deleteAll(notifications);
    }

    // Admin: Get detailed notification statistics
    public Map<String, Object> getNotificationStatistics() {
        Map<String, Object> stats = new HashMap<>();
        List<Notification> allNotifications = notificationRepository.findAll();
        long total = allNotifications.size();
        stats.put("totalNotifications", total);
        long read = allNotifications.stream().filter(Notification::isRead).count();
        stats.put("readNotifications", read);
        long unread = total - read;
        stats.put("unreadNotifications", unread);
        // Breakdown by notification type
        Map<String, Long> typeCounts = allNotifications.stream()
                .collect(Collectors.groupingBy(n -> n.getNotificationType().name(), Collectors.counting()));
        stats.put("notificationsByType", typeCounts);
        // Breakdown per recipient (for top recipients)
        Map<String, Long> notificationsByRecipient = allNotifications.stream()
                .collect(Collectors.groupingBy(n -> n.getRecipient().getUsername(), Collectors.counting()));
        stats.put("notificationsByRecipient", notificationsByRecipient);
        return stats;
    }

    // Admin: Get notification by ID remains the same
    public NotificationResponseDto getNotificationById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        return mapToDto(notification);
    }

    // Admin: Delete a notification by ID remains the same
    public void deleteNotification(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notificationRepository.delete(notification);
    }
    // Convert Notification entity to DTO
    private NotificationResponseDto mapToDto(Notification notification) {
        NotificationResponseDto dto = new NotificationResponseDto();
        dto.setId(notification.getId());
        dto.setMessage(notification.getMessage());
        dto.setNotificationType(notification.getNotificationType());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setRelatedPostId(notification.getRelatedPostId());
        dto.setRelatedCommentId(notification.getRelatedCommentId());
        return dto;
    }
}
