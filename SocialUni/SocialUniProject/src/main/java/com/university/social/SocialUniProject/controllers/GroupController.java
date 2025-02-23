package com.university.social.SocialUniProject.controllers;

import com.university.social.SocialUniProject.dto.CreateNotificationDto;
import com.university.social.SocialUniProject.dto.GroupDto.CreateGroupDto;
import com.university.social.SocialUniProject.dto.RequestDto;
import com.university.social.SocialUniProject.models.Enums.NotificationType;
import com.university.social.SocialUniProject.models.Group;
import com.university.social.SocialUniProject.responses.GroupResponseDto;
import com.university.social.SocialUniProject.models.Enums.Category;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.services.GroupServices.GroupService;
import com.university.social.SocialUniProject.services.NotificationService;
import com.university.social.SocialUniProject.services.UserServices.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;
    @Autowired
    private UserService userService;
    @Autowired
    private NotificationService notificationService;


    @GetMapping("/public")
    public ResponseEntity<List<GroupResponseDto>> getPublicGroups() {
        List<GroupResponseDto> groups = groupService.getPublicGroups();
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/topGroupsByMembers")
    public ResponseEntity<List<GroupResponseDto>> getPublicGroupsSortedByMembers() {
        List<GroupResponseDto> groups = groupService.getPublicGroupsSortedByMembers();
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/my-groups")
    public ResponseEntity<List<GroupResponseDto>> getUserGroups() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userId = authentication.getName();
        return ResponseEntity.ok(groupService.getUserGroups(Long.parseLong(userId)));
    }
    @GetMapping("/category/{category}")
    public ResponseEntity<List<GroupResponseDto>> getGroupsByCategory(@PathVariable Category category) {
        return ResponseEntity.ok(groupService.getGroupsByCategory(category));
    }

    @PostMapping("/create")
    public ResponseEntity<GroupResponseDto> createGroup(@RequestBody CreateGroupDto groupDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        String userId = authentication.getName();
        User user = userService.getUserById(Long.parseLong(userId));
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        GroupResponseDto response = groupService.createGroup(groupDto, user.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/join/{groupId}")
    public ResponseEntity<String> joinGroup(@PathVariable Long groupId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = Long.parseLong(authentication.getName());
        String response = groupService.handleJoinRequest(userId, groupId);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/requests/{groupId}")
    public ResponseEntity<Set<RequestDto>> getPendingJoinRequests(@PathVariable Long groupId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long adminId = Long.parseLong(authentication.getName());
        Set<RequestDto> pendingRequests = groupService.getPendingJoinRequests(adminId, groupId);
        return ResponseEntity.ok(pendingRequests);
    }
    @PostMapping("/approve/{groupId}/{userId}")
    public ResponseEntity<String> approveJoinRequest(@PathVariable Long groupId, @PathVariable Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long adminId = Long.parseLong(authentication.getName());
        String response = groupService.approveJoinRequest(adminId, userId, groupId);
        return ResponseEntity.ok(response);
    }



    @PostMapping("/leave/{groupId}")
    public ResponseEntity<String> leaveGroup(@PathVariable Long groupId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        try {
            Long userId = Long.parseLong(authentication.getName());
            String response = groupService.leaveGroup(userId, groupId);

            GroupResponseDto groupDto = groupService.getGroupById(groupId); // Use DTO instead of entity
            User leavingUser = userService.getUserById(userId);

            if (groupDto.getAdminIds() != null) {
                for (Long adminId : groupDto.getAdminIds()) {
                    if (!adminId.equals(userId)) { // Prevent self-notification
                        notificationService.createNotification(new CreateNotificationDto(
                                leavingUser.getUsername() + " left your group " + groupDto.getName(),
                                NotificationType.GROUP_LEAVE,
                                adminId,
                                null,
                                null
                        ));
                    }
                }
            }

            return ResponseEntity.ok(response);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid User ID format");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }


    @DeleteMapping("/{groupId}")
    public ResponseEntity<?> deleteGroup(@PathVariable Long groupId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userId = authentication.getName();
        try {
            groupService.deleteGroup(groupId, Long.parseLong(userId));
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
}
