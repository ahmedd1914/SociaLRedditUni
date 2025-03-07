package com.university.social.SocialUniProject.controllers;

import com.university.social.SocialUniProject.dto.CreateNotificationDto;
import com.university.social.SocialUniProject.responses.NotificationResponseDto;
import com.university.social.SocialUniProject.services.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Create a new notification (for testing/admin use)
    @PostMapping
    public ResponseEntity<NotificationResponseDto> createNotification(@RequestBody CreateNotificationDto dto) {
        NotificationResponseDto response = notificationService.createNotification(dto);
        return ResponseEntity.ok(response);
    }

    // Get all notifications for a user
    @GetMapping("/{userId}")
    public ResponseEntity<List<NotificationResponseDto>> getUserNotifications(@PathVariable Long userId) {
        List<NotificationResponseDto> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    // Get unread notifications for a user
    @GetMapping("/{userId}/unread")
    public ResponseEntity<List<NotificationResponseDto>> getUnreadNotifications(@PathVariable Long userId) {
        List<NotificationResponseDto> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    // Mark a notification as read
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Long notificationId) {
        notificationService.markNotificationAsRead(notificationId);
        return ResponseEntity.noContent().build();
    }
}
