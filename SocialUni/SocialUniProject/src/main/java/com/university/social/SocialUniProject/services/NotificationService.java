package com.university.social.SocialUniProject.services;


import com.university.social.SocialUniProject.dto.CreateNotificationDto;
import com.university.social.SocialUniProject.models.Enums.NotificationType;
import com.university.social.SocialUniProject.models.Notification;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.repositories.NotificationRepository;
import com.university.social.SocialUniProject.repositories.UserRepository;
import com.university.social.SocialUniProject.responses.NotificationResponseDto;
import org.springframework.stereotype.Service;

import java.util.List;
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
