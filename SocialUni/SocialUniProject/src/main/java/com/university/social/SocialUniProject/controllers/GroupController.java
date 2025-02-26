package com.university.social.SocialUniProject.controllers;

import com.university.social.SocialUniProject.dto.CreateGroupDto;
import com.university.social.SocialUniProject.dto.RequestDto;
import com.university.social.SocialUniProject.enums.Category;
import com.university.social.SocialUniProject.enums.NotificationType;
import com.university.social.SocialUniProject.responses.GroupResponseDto;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.services.GroupServices.GroupService;
import com.university.social.SocialUniProject.services.NotificationService;
import com.university.social.SocialUniProject.services.UserServices.UserService;
import com.university.social.SocialUniProject.utils.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/groups")
public class GroupController {

    private final GroupService groupService;
    private final UserService userService;
    private final NotificationService notificationService;

    public GroupController(GroupService groupService,
                           UserService userService,
                           NotificationService notificationService) {
        this.groupService = groupService;
        this.userService = userService;
        this.notificationService = notificationService;
    }

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
        Long userId = SecurityUtils.getAuthenticatedUserId();
        List<GroupResponseDto> groups = groupService.getUserGroups(userId);
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<GroupResponseDto>> getGroupsByCategory(@PathVariable Category category) {
        return ResponseEntity.ok(groupService.getGroupsByCategory(category));
    }

    @PostMapping("/create")
    public ResponseEntity<GroupResponseDto> createGroup(@RequestBody CreateGroupDto groupDto) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        // Optionally, you can fetch the user (if needed) via userService.getUserById(userId)
        GroupResponseDto response = groupService.createGroup(groupDto, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/join/{groupId}")
    public ResponseEntity<String> joinGroup(@PathVariable Long groupId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        String response = groupService.handleJoinRequest(userId, groupId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/requests/{groupId}")
    public ResponseEntity<Set<RequestDto>> getPendingJoinRequests(@PathVariable Long groupId) {
        Long adminId = SecurityUtils.getAuthenticatedUserId();
        Set<RequestDto> pendingRequests = groupService.getPendingJoinRequests(adminId, groupId);
        return ResponseEntity.ok(pendingRequests);
    }

    @PostMapping("/approve/{groupId}/{userId}")
    public ResponseEntity<String> approveJoinRequest(@PathVariable Long groupId, @PathVariable Long userId) {
        Long adminId = SecurityUtils.getAuthenticatedUserId();
        String response = groupService.approveJoinRequest(adminId, userId, groupId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/leave/{groupId}")
    public ResponseEntity<String> leaveGroup(@PathVariable Long groupId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        String response = groupService.leaveGroup(userId, groupId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long groupId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        groupService.deleteGroup(groupId, userId);
        return ResponseEntity.ok().build();
    }
}
