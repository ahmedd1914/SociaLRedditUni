package com.university.social.SocialUniProject.controllers.AdminControllers;

import com.university.social.SocialUniProject.dto.AdminStatsDto;
import com.university.social.SocialUniProject.dto.NotificationStatsDto;
import com.university.social.SocialUniProject.dto.ReactionStatsDto;
import com.university.social.SocialUniProject.services.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/stats")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminStatsController {

    private final AdminService adminService;

    public AdminStatsController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public ResponseEntity<AdminStatsDto> getAdminStats() {
        return ResponseEntity.ok(adminService.getAdminStats());
    }

    @GetMapping("/notifications")
    public ResponseEntity<NotificationStatsDto> getNotificationStats() {
        return ResponseEntity.ok(adminService.getNotificationStats());
    }

    @GetMapping("/reactions")
    public ResponseEntity<ReactionStatsDto> getReactionStats() {
        return ResponseEntity.ok(adminService.getReactionStats());
    }
} 