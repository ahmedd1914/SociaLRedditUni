package com.university.social.SocialUniProject.services;

import com.university.social.SocialUniProject.dto.CreateNotificationDto;
import com.university.social.SocialUniProject.exceptions.ResourceNotFoundException;
import com.university.social.SocialUniProject.models.Notification;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.repositories.NotificationRepository;
import com.university.social.SocialUniProject.repositories.UserRepository;
import com.university.social.SocialUniProject.responses.NotificationResponseDto;
import com.university.social.SocialUniProject.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // Helper method for fetching a User by ID
    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    // Create and save a new notification with optional metadata
    public NotificationResponseDto createNotification(CreateNotificationDto dto) {
        User recipient = getUserById(dto.getRecipientId());
        String message = dto.getMessage() != null ? dto.getMessage() : dto.getNotificationType().getDefaultMessage();
        
        Notification notification = new Notification(
                message,
                dto.getNotificationType(),
                recipient,
                dto.getRelatedPostId(),
                dto.getRelatedCommentId()
        );
        
        // Set optional metadata
        if (dto.getMetadata() != null) {
            notification.setMetadata(dto.getMetadata());
        }
        
        notificationRepository.save(notification);
        return mapToDto(notification);
    }

    // Create notifications for multiple recipients
    public List<NotificationResponseDto> createBulkNotifications(CreateNotificationDto dto, List<Long> recipientIds) {
        return recipientIds.stream()
                .map(recipientId -> {
                    CreateNotificationDto recipientDto = new CreateNotificationDto(
                            dto.getMessage(),
                            dto.getNotificationType(),
                            recipientId,
                            dto.getRelatedPostId(),
                            dto.getRelatedCommentId()
                    );
                    return createNotification(recipientDto);
                })
                .collect(Collectors.toList());
    }

    // Get notifications with advanced filtering
    public List<NotificationResponseDto> getFilteredNotifications(
            Long userId,
            NotificationType type,
            Boolean isRead,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String searchTerm,
            int page,
            int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        List<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(
                getUserById(userId), pageable).getContent();

        return notifications.stream()
                .filter(n -> type == null || n.getNotificationType() == type)
                .filter(n -> isRead == null || n.isRead() == isRead)
                .filter(n -> startDate == null || n.getCreatedAt().isAfter(startDate))
                .filter(n -> endDate == null || n.getCreatedAt().isBefore(endDate))
                .filter(n -> searchTerm == null || n.getMessage().toLowerCase().contains(searchTerm.toLowerCase()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Get notification statistics with more detailed metrics
    public Map<String, Object> getNotificationStatistics() {
        Map<String, Object> stats = new HashMap<>();
        List<Notification> allNotifications = notificationRepository.findAll();
        
        // Basic stats
        long total = allNotifications.size();
        stats.put("totalNotifications", total);
        
        // Read/Unread stats
        long read = allNotifications.stream().filter(Notification::isRead).count();
        stats.put("readNotifications", read);
        stats.put("unreadNotifications", total - read);
        
        // Time-based stats
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime last24Hours = now.minusHours(24);
        LocalDateTime last7Days = now.minusDays(7);
        LocalDateTime last30Days = now.minusDays(30);
        
        stats.put("notificationsLast24Hours", 
                allNotifications.stream().filter(n -> n.getCreatedAt().isAfter(last24Hours)).count());
        stats.put("notificationsLast7Days", 
                allNotifications.stream().filter(n -> n.getCreatedAt().isAfter(last7Days)).count());
        stats.put("notificationsLast30Days", 
                allNotifications.stream().filter(n -> n.getCreatedAt().isAfter(last30Days)).count());
        
        // Type-based stats
        Map<String, Long> typeCounts = allNotifications.stream()
                .collect(Collectors.groupingBy(n -> n.getNotificationType().name(), Collectors.counting()));
        stats.put("notificationsByType", typeCounts);
        
        // Recipient-based stats
        Map<String, Long> notificationsByRecipient = allNotifications.stream()
                .collect(Collectors.groupingBy(n -> n.getRecipient().getUsername(), Collectors.counting()));
        stats.put("notificationsByRecipient", notificationsByRecipient);
        
        // Read rate by type
        Map<String, Double> readRateByType = allNotifications.stream()
                .collect(Collectors.groupingBy(
                        n -> n.getNotificationType().name(),
                        Collectors.collectingAndThen(
                                Collectors.partitioningBy(Notification::isRead),
                                map -> map.get(true).size() / (double) (map.get(true).size() + map.get(false).size())
                        )
                ));
        stats.put("readRateByType", readRateByType);
        
        return stats;
    }

    // Clean up old notifications
    @Scheduled(cron = "0 0 0 * * *") // Run daily at midnight
    public void cleanupOldNotifications() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Notification> oldNotifications = notificationRepository.findByCreatedAtBeforeAndIsReadTrue(thirtyDaysAgo);
        notificationRepository.deleteAll(oldNotifications);
    }

    // Convert Notification entity to DTO with additional fields
    private NotificationResponseDto mapToDto(Notification notification) {
        NotificationResponseDto dto = new NotificationResponseDto();
        dto.setId(notification.getId());
        dto.setMessage(notification.getMessage());
        dto.setNotificationType(notification.getNotificationType());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setRelatedPostId(notification.getRelatedPostId());
        dto.setRelatedCommentId(notification.getRelatedCommentId());
        dto.setMetadata(notification.getMetadata());
        return dto;
    }

    // Get all notifications for a user
    public List<NotificationResponseDto> getUserNotifications(Long userId) {
        User user = getUserById(userId);
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Get unread notifications for a user
    public List<NotificationResponseDto> getUnreadNotifications(Long userId) {
        User user = getUserById(userId);
        return notificationRepository.findByRecipientAndIsReadFalse(user)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Mark a notification as read
    public void markNotificationAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    // Admin methods
    public List<NotificationResponseDto> getAllNotifications(
            String search,
            Long recipientId,
            Boolean isRead,
            String category,
            int page,
            int size) {
        
        User recipient = recipientId != null ? getUserById(recipientId) : null;
        Pageable pageable = PageRequest.of(page, size);
        
        // Convert category to list of notification types
        List<NotificationType> categoryTypes = null;
        if (category != null && !category.equals("ALL")) {
            categoryTypes = Arrays.asList(NotificationType.values()).stream()
                    .filter(type -> type.name().startsWith(category))
                    .collect(Collectors.toList());
        }
        
        Page<Notification> notifications = notificationRepository.findFilteredNotifications(
                recipient,
                null, // type
                isRead,
                null, // startDate
                null, // endDate
                search,
                category,
                categoryTypes,
                pageable
        );
        
        return notifications.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public NotificationResponseDto getNotificationById(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        return mapToDto(notification);
    }

    public void bulkMarkAsRead(List<Long> notificationIds) {
        notificationIds.forEach(this::markNotificationAsRead);
    }

    public void deleteNotification(Long notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new ResourceNotFoundException("Notification not found");
        }
        notificationRepository.deleteById(notificationId);
    }

    public void bulkDeleteNotifications(List<Long> notificationIds) {
        notificationIds.forEach(this::deleteNotification);
    }
}
