package com.university.social.SocialUniProject.controllers.AdminControllers;

import com.university.social.SocialUniProject.dto.RequestDto;
import com.university.social.SocialUniProject.dto.UserDto.UsersDto;
import com.university.social.SocialUniProject.models.Enums.Visibility;
import com.university.social.SocialUniProject.responses.GroupResponseDto;
import com.university.social.SocialUniProject.services.GroupServices.GroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminGroupController {

    private final GroupService groupService;

    public AdminGroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @GetMapping("/groups")
    public ResponseEntity<List<GroupResponseDto>> getAllGroups() {
        return ResponseEntity.ok(groupService.getAllGroups());
    }

    // Get group by id
    @GetMapping("/groups/{groupId}")
    public ResponseEntity<GroupResponseDto> getGroupById(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getGroupById(groupId));
    }

    // Delete group (admin deletion)
    @DeleteMapping("/groups/{groupId}/user/{userId}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long groupId, @PathVariable Long userId) {
        groupService.deleteGroup(groupId, userId);
        return ResponseEntity.noContent().build();
    }


    // Change group visibility and return updated group
    @PutMapping("/groups/{groupId}/visibility")
    public ResponseEntity<GroupResponseDto> changeGroupVisibility(@PathVariable Long groupId,
                                                                  @RequestParam Visibility visibility) {
        groupService.changeGroupVisibility(groupId, visibility);
        GroupResponseDto updatedGroup = groupService.getGroupById(groupId);
        return ResponseEntity.ok(updatedGroup);
    }

    // Transfer group ownership and return updated group
    @PutMapping("/groups/{groupId}/transfer/{newOwnerId}")
    public ResponseEntity<GroupResponseDto> transferGroupOwnership(@PathVariable Long groupId,
                                                                   @PathVariable Long newOwnerId) {
        groupService.transferGroupOwnership(groupId, newOwnerId);
        GroupResponseDto updatedGroup = groupService.getGroupById(groupId);
        return ResponseEntity.ok(updatedGroup);
    }

    // Get pending join requests (admin version: requires adminId)
    @GetMapping("/groups/{groupId}/join-requests")
    public ResponseEntity<Set<RequestDto>> getPendingJoinRequests(@PathVariable Long groupId,
                                                                  @RequestParam Long adminId) {
        return ResponseEntity.ok(groupService.getPendingJoinRequests(adminId, groupId));
    }

    // Approve join request (admin version: requires adminId)
    @PostMapping("/groups/{groupId}/approve/{userId}")
    public ResponseEntity<String> approveJoinRequest(@PathVariable Long groupId,
                                                     @PathVariable Long userId,
                                                     @RequestParam Long adminId) {
        String result = groupService.approveJoinRequest(adminId, userId, groupId);
        return ResponseEntity.ok(result);
    }

    // Reject join request (admin)
    @DeleteMapping("/groups/{groupId}/reject/{userId}")
    public ResponseEntity<Void> rejectJoinRequest(@PathVariable Long groupId,
                                                  @PathVariable Long userId) {
        groupService.rejectJoinRequest(groupId, userId);
        return ResponseEntity.noContent().build();
    }

    // Get group members
    @GetMapping("/groups/{groupId}/members")
    public ResponseEntity<List<UsersDto>> getGroupMembers(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getGroupMembers(groupId));
    }

    // Remove user from group
    @DeleteMapping("/groups/{groupId}/remove/{userId}")
    public ResponseEntity<Void> removeUserFromGroup(@PathVariable Long groupId,
                                                    @PathVariable Long userId) {
        groupService.removeUserFromGroup(groupId, userId);
        return ResponseEntity.noContent().build();
    }

    // Add user to group
    @PostMapping("/groups/{groupId}/add/{userId}")
    public ResponseEntity<Void> addUserToGroup(@PathVariable Long groupId,
                                               @PathVariable Long userId) {
        groupService.addUserToGroup(groupId, userId);
        return ResponseEntity.ok().build();
    }
}
