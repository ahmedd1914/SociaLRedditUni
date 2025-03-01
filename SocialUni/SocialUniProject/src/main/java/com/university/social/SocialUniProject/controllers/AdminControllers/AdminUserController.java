package com.university.social.SocialUniProject.controllers.AdminControllers;

import com.university.social.SocialUniProject.dto.AdminActionDto;
import com.university.social.SocialUniProject.responses.UserResponseDto;
import com.university.social.SocialUniProject.enums.Role;
import com.university.social.SocialUniProject.services.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminUserController {

    private final AdminService adminService;
    public AdminUserController(AdminService adminService) {
        this.adminService = adminService;

    }

    // 1️⃣ View All Users
    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }
    @GetMapping("/users/{userId}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long userId) {
        try {
            UserResponseDto user = adminService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    // 2️⃣ Search & Filter Users
    @GetMapping("/users/search")
    public ResponseEntity<List<UserResponseDto>> searchUsers(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) Role role) {
        if ((username == null || username.isBlank()) && role == null) {
            return ResponseEntity.badRequest().body(List.of());
        }
        return ResponseEntity.ok(adminService.searchUsers(username, role));
    }

    // 3️⃣ Ban User
    @PostMapping("/ban-user/{userId}")
    public ResponseEntity<String> banUser(@PathVariable Long userId) {
        try {
            adminService.banUser(userId);
            return ResponseEntity.ok("User with ID " + userId + " has been banned.");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // 4️⃣ Unban User
    @PostMapping("/unban-user/{userId}")
    public ResponseEntity<String> unbanUser(@PathVariable Long userId) {
        try {
            adminService.unbanUser(userId);
            return ResponseEntity.ok("User with ID " + userId + " has been unbanned.");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // 5️⃣ Change User Role
    @PostMapping("/change-role")
    public ResponseEntity<String> changeUserRole(@Valid @RequestBody AdminActionDto request) {
        try {
            adminService.changeUserRole(request.getUserId(), request.getNewRole());
            return ResponseEntity.ok("User role updated successfully.");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // 6️⃣ Delete User
    @DeleteMapping("/delete-user/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable Long userId) {
        try {
            adminService.deleteUser(userId);
            return ResponseEntity.ok("User with ID " + userId + " has been deleted.");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

}
