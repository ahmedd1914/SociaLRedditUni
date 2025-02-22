package com.university.social.SocialUniProject.controllers;

import com.university.social.SocialUniProject.services.UserServices.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<String> getAdminDashboard() {
        return ResponseEntity.ok("Welcome to Admin Dashboard");
    }

//    @PostMapping("/ban-user/{userId}")
//    public ResponseEntity<String> banUser(@PathVariable Long userId) {
//        userService.banUser(userId);
//        return ResponseEntity.ok("User has been banned.");
//    }
}
