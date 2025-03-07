package com.university.social.SocialUniProject.controllers;

import com.university.social.SocialUniProject.dto.UserActivityDto;
import com.university.social.SocialUniProject.services.UserActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserActivityController {

    private final UserActivityService userActivityService;

    public UserActivityController(UserActivityService userActivityService) {
        this.userActivityService = userActivityService;
    }

    @GetMapping("/{userId}/activities")
    public ResponseEntity<List<UserActivityDto>> getUserActivities(@PathVariable Long userId) {
        List<UserActivityDto> activities = userActivityService.getUserActivities(userId);
        return ResponseEntity.ok(activities);
    }
}
