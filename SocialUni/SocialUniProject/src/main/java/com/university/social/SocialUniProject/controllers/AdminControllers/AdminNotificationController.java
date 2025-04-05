package com.university.social.SocialUniProject.controllers.AdminControllers;

import com.university.social.SocialUniProject.responses.NotificationResponseDto;
import com.university.social.SocialUniProject.services.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/notifications")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminNotificationController {

    private final NotificationService notificationService;

    public AdminNotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // 1. List all notifications with optional filters and pagination
    @GetMapping
    public ResponseEntity<List<NotificationResponseDto>> getAllNotifications(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long recipientId,
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<NotificationResponseDto> notifications = notificationService.getAllNotifications(search, recipientId, isRead, category, page, size);
        return ResponseEntity.ok(notifications);
    }

    // 2. Get a notification by ID
    @GetMapping("/{notificationId}")
    public ResponseEntity<NotificationResponseDto> getNotificationById(@PathVariable Long notificationId) {
        NotificationResponseDto notification = notificationService.getNotificationById(notificationId);
        return ResponseEntity.ok(notification);
    }

    // 3. Mark a single notification as read
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Long notificationId) {
        notificationService.markNotificationAsRead(notificationId);
        return ResponseEntity.noContent().build();
    }

    // 4. Bulk mark notifications as read
    @PutMapping("/mark-read")
    public ResponseEntity<Void> bulkMarkAsRead(@RequestBody List<Long> notificationIds) {
        notificationService.bulkMarkAsRead(notificationIds);
        return ResponseEntity.noContent().build();
    }

    // 5. Delete a notification by ID
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.noContent().build();
    }

    // 6. Bulk delete notifications
    @DeleteMapping("/bulk")
    public ResponseEntity<Void> bulkDeleteNotifications(@RequestBody List<Long> notificationIds) {
        notificationService.bulkDeleteNotifications(notificationIds);
        return ResponseEntity.noContent().build();
    }

    // 7. Get notification statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getNotificationStats() {
        Map<String, Object> stats = notificationService.getNotificationStatistics();
        return ResponseEntity.ok(stats);
    }
}
