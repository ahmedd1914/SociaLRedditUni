package com.university.social.SocialUniProject.controllers;

import com.university.social.SocialUniProject.dto.UpdateUserDto;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.services.UserServices.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/users")
@RestController
public class UserController {
    private final UserService userService;
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        logger.info("Attempting to get current user");
        
        if (authentication == null) {
            logger.error("No authentication object found");
            return ResponseEntity.status(401).build();
        }
        
        if (!authentication.isAuthenticated()) {
            logger.error("User is not authenticated");
            return ResponseEntity.status(401).build();
        }
        
        try {
            String email = authentication.getName();
            logger.info("Getting user details for email: {}", email);
            
            User user = (User) userService.loadUserByUsername(email);
            logger.info("Successfully retrieved user: {}", user.getUsername());
            
            return ResponseEntity.ok(user);
        } catch (UsernameNotFoundException e) {
            logger.error("User not found in database", e);
            return ResponseEntity.status(404).build();
        } catch (Exception e) {
            logger.error("Error retrieving current user", e);
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long userId,
            @RequestBody UpdateUserDto updateUserDto) {
        userService.updateUser(userId, updateUserDto);
        return ResponseEntity.ok("User updated successfully");
    }

}
