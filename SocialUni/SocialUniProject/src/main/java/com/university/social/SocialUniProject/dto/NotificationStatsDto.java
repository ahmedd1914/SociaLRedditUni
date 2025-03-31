package com.university.social.SocialUniProject.dto;

import lombok.Data;
import java.util.Map;

@Data
public class NotificationStatsDto {
    private long totalNotifications;
    private long unreadCount;
    private long recentNotificationsCount;
    private Map<String, Long> notificationsByType;
} 