package com.university.social.SocialUniProject.controllers;

import com.university.social.SocialUniProject.dto.UpdateUserDto;
import com.university.social.SocialUniProject.dto.UserDto.UsersDto;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.services.UserServices.UserService;
import com.university.social.SocialUniProject.utils.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import com.university.social.SocialUniProject.exceptions.ResourceNotFoundException;

@RequestMapping("/users")
@RestController
public class UserController {
    private final UserService userService;
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UsersDto> getUserById(@PathVariable Long userId) {
        try {
            // Get authenticated user ID
            Long authenticatedUserId = SecurityUtils.getAuthenticatedUserId();
            
            // Only allow users to access their own profile or if they are admin
            if (!authenticatedUserId.equals(userId) && !SecurityUtils.hasRole("ROLE_ADMIN")) {
                logger.warn("User {} attempted to access profile of user {}", authenticatedUserId, userId);
                return ResponseEntity.noContent().build();
            }
            
            User user = userService.loadUserById(userId);
            logger.info("Successfully retrieved user profile for ID: {}", userId);
            return ResponseEntity.ok(UsersDto.fromEntity(user));
        } catch (Exception e) {
            logger.error("Error retrieving user profile for ID: {}", userId, e);
            return ResponseEntity.noContent().build();
        }
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

    @GetMapping("/profile/{username}/public")
    public ResponseEntity<Map<String, String>> getPublicUserProfile(@PathVariable String username) {
        try {
            User user = userService.getUserByUsername(username);
            Map<String, String> publicProfile = new HashMap<>();
            publicProfile.put("username", user.getUsername());
            publicProfile.put("firstName", user.getFName());
            publicProfile.put("lastName", user.getLName());
            publicProfile.put("imageUrl", user.getImgUrl());
            
            return ResponseEntity.ok(publicProfile);
        } catch (ResourceNotFoundException e) {
            logger.warn("User not found: {}", username);
            return ResponseEntity.ok(new HashMap<>()); // Return empty profile instead of 404
        } catch (Exception e) {
            logger.error("Error retrieving public profile for user: {}", username, e);
            return ResponseEntity.ok(new HashMap<>()); // Return empty profile instead of error
        }
    }
}
