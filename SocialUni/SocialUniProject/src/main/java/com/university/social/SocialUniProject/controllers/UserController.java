package com.university.social.SocialUniProject.controllers;

import com.university.social.SocialUniProject.dto.UpdateUserDto;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.services.UserServices.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/users")
@RestController
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long userId,
            @RequestBody UpdateUserDto updateUserDto) {
        userService.updateUser(userId, updateUserDto);
        return ResponseEntity.ok("User updated successfully");
    }

}
