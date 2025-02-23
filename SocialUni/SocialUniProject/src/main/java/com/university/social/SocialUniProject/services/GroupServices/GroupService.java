package com.university.social.SocialUniProject.services.GroupServices;

import com.university.social.SocialUniProject.dto.CreateNotificationDto;
import com.university.social.SocialUniProject.dto.GroupDto.CreateGroupDto;
import com.university.social.SocialUniProject.dto.RequestDto;
import com.university.social.SocialUniProject.dto.UserDto.UsersDto;
import com.university.social.SocialUniProject.models.Enums.NotificationType;
import com.university.social.SocialUniProject.models.Enums.Visibility;
import com.university.social.SocialUniProject.responses.GroupResponseDto;
import com.university.social.SocialUniProject.models.Enums.Category;
import com.university.social.SocialUniProject.models.Group;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.repositories.GroupRepository;
import com.university.social.SocialUniProject.repositories.UserRepository;
import com.university.social.SocialUniProject.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private NotificationService notificationService;

    public GroupService(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

    public GroupResponseDto createGroup(CreateGroupDto groupDto, Long userId) {
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Group group = new Group();
        group.setName(groupDto.getName());
        group.setDescription(groupDto.getDescription());

        // Set visibility directly from the enum in CreateGroupDto
        // (If the DTO has a getVisibility() method returning Visibility)
        group.setVisibility(groupDto.getVisibility() != null
                ? groupDto.getVisibility()
                : Visibility.PUBLIC);

        group.setCategory(groupDto.getCategory());

        // Add creator as member, admin, and owner
        group.getMembers().add(creator);
        group.getAdmins().add(creator);
        group.setOwner(creator);

        Group savedGroup = groupRepository.save(group);
        return convertToDto(savedGroup);
    }


    public String handleJoinRequest(Long userId, Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (group.getMembers().contains(user)) {
            return "You are already a member of this group.";
        }

        if (!group.getVisibility().equals(Visibility.PRIVATE)) {
            // If public, join immediately
            group.getMembers().add(user);
            groupRepository.save(group);
            return "Joined the group successfully!";
        } else {
            // If private, send a join request
            if (group.getJoinRequests().contains(user)) {
                return "You have already requested to join this group.";
            }
            group.getJoinRequests().add(user);
            groupRepository.save(group);

            // Notify admins about the request
            for (User admin : group.getAdmins()) {
                notificationService.createNotification(new CreateNotificationDto(
                        user.getUsername() + " requested to join your group " + group.getName(),
                        NotificationType.GROUP_JOIN_REQUEST,
                        admin.getId(),
                        null,
                        null
                ));
            }
            return "Join request sent. Await admin approval.";
        }
    }

    public Set<RequestDto> getPendingJoinRequests(Long adminId, Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        if (!group.getAdmins().contains(admin)) {
            throw new RuntimeException("You are not an admin of this group.");
        }

        return group.getJoinRequests().stream()
                .map(user -> new RequestDto(user.getId(), user.getUsername(), user.getEmail()))
                .collect(Collectors.toSet());
    }

    public String approveJoinRequest(Long adminId, Long userId, Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!group.getAdmins().contains(admin)) {
            throw new RuntimeException("You are not an admin of this group.");
        }

        if (!group.getJoinRequests().contains(user)) {
            return "No pending join request from this user.";
        }

        group.getJoinRequests().remove(user);
        group.getMembers().add(user);
        groupRepository.save(group);

        return "Join request approved.";
    }

    public String leaveGroup(Long userId, Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        group.getMembers().remove(user);
        groupRepository.save(group);
        return "User left the group successfully";
    }

    public void rejectJoinRequest(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!group.getJoinRequests().contains(user)) {
            throw new RuntimeException("No pending request from this user");
        }

        group.getJoinRequests().remove(user);
        groupRepository.save(group);
    }

    public void deleteGroup(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!group.getMembers().contains(user)) {
            throw new RuntimeException("Unauthorized: Only group members can delete the group.");
        }
        groupRepository.delete(group);
    }

    public List<GroupResponseDto> getGroupsByCategory(Category category) {
        return groupRepository.findByCategory(category).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<GroupResponseDto> getUserGroups(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getGroups().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<GroupResponseDto> getPublicGroups() {
        return groupRepository.findByVisibility(Visibility.PUBLIC)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }


    public List<GroupResponseDto> getPublicGroupsSortedByMembers() {
        return groupRepository.findAll().stream()
                .sorted(Comparator.comparingInt(group -> -group.getMembers().size()))
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public GroupResponseDto getGroupById(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return GroupResponseDto.fromEntity(group);
    }

    public List<GroupResponseDto> getAllGroups() {
        return groupRepository.findAll().stream()
                .map(GroupResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    public void changeGroupVisibility(Long groupId, Visibility visibility) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        group.setVisibility(visibility);
        groupRepository.save(group);
    }

    public void transferGroupOwnership(Long groupId, Long newOwnerId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User newOwner = userRepository.findById(newOwnerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!group.getMembers().contains(newOwner)) {
            throw new RuntimeException("New owner must be a member of the group");
        }

        group.setOwner(newOwner);
        groupRepository.save(group);
    }

    public List<UsersDto> getGroupMembers(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return group.getMembers().stream()
                .map(UsersDto::fromEntity)
                .collect(Collectors.toList());
    }

    public void removeUserFromGroup(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!group.getMembers().contains(user)) {
            throw new RuntimeException("User is not a member of this group");
        }

        group.getMembers().remove(user);
        groupRepository.save(group);
    }

    public void addUserToGroup(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (group.getMembers().contains(user)) {
            throw new RuntimeException("User is already a member of this group");
        }

        group.getMembers().add(user);
        groupRepository.save(group);
    }

    private GroupResponseDto convertToDto(Group group) {
        return new GroupResponseDto(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getMembers() != null ? group.getMembers().size() : 0,
                group.getVisibility(),
                group.getCategory(),
                group.getOwner() != null ? group.getOwner().getId() : null,
                group.getAdmins() != null
                        ? group.getAdmins().stream().map(User::getId).collect(Collectors.toList())
                        : Collections.emptyList(),
                group.getMembers() != null
                        ? group.getMembers().stream().map(User::getId).collect(Collectors.toList())
                        : Collections.emptyList()
        );
    }
}
