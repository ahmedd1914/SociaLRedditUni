package com.university.social.SocialUniProject.services.GroupServices;

import com.university.social.SocialUniProject.dto.CreateNotificationDto;
import com.university.social.SocialUniProject.dto.CreateGroupDto;
import com.university.social.SocialUniProject.dto.RequestDto;
import com.university.social.SocialUniProject.dto.UserDto.UsersDto;
import com.university.social.SocialUniProject.enums.NotificationType;
import com.university.social.SocialUniProject.enums.Visibility;
import com.university.social.SocialUniProject.enums.Category;
import com.university.social.SocialUniProject.exceptions.ResourceNotFoundException;
import com.university.social.SocialUniProject.exceptions.UnauthorizedActionException;
import com.university.social.SocialUniProject.models.Group;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.repositories.GroupRepository;
import com.university.social.SocialUniProject.repositories.UserRepository;
import com.university.social.SocialUniProject.services.NotificationService;
import com.university.social.SocialUniProject.responses.GroupResponseDto;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GroupService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Autowired
    public GroupService(GroupRepository groupRepository,
                        UserRepository userRepository,
                        NotificationService notificationService) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // Helper methods for fetching entities
    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Group getGroupById(Long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
    }

    public GroupResponseDto createGroup(CreateGroupDto groupDto, Long userId) {
        User creator = getUserById(userId);

        Group group = new Group();
        group.setName(groupDto.getName());
        group.setDescription(groupDto.getDescription());
        group.setVisibility(groupDto.getVisibility() != null ? groupDto.getVisibility() : Visibility.PUBLIC);
        group.setCategory(groupDto.getCategory());

        // Add creator as member, admin, and owner
        group.getMembers().add(creator);
        group.getAdmins().add(creator);
        group.setOwner(creator);

        Group savedGroup = groupRepository.save(group);

        // Notify creator about group creation
        notificationService.createNotification(new CreateNotificationDto(
                "Your group '" + savedGroup.getName() + "' has been created.",
                NotificationType.GROUP_CREATED,
                creator.getId(),
                null,
                null
        ));

        return convertToDto(savedGroup);
    }
    @Transactional
    public GroupResponseDto updateGroup(Long groupId, CreateGroupDto updatedGroupDto, Long userId) {
        // Retrieve the group and user entities
        Group group = getGroupById(groupId);
        User user = getUserById(userId);

        // Allow update only if the user is the owner or an admin of the group
        if (!group.getOwner().getId().equals(userId) && !group.getAdmins().contains(user)) {
            throw new UnauthorizedActionException("You are not authorized to update this group.");
        }

        // Update group fields if new values are provided
        if (updatedGroupDto.getName() != null && !updatedGroupDto.getName().isBlank()) {
            group.setName(updatedGroupDto.getName());
        }
        if (updatedGroupDto.getDescription() != null) {
            group.setDescription(updatedGroupDto.getDescription());
        }
        if (updatedGroupDto.getVisibility() != null) {
            group.setVisibility(updatedGroupDto.getVisibility());
        }
        if (updatedGroupDto.getCategory() != null) {
            group.setCategory(updatedGroupDto.getCategory());
        }

        // Save the updated group
        Group updatedGroup = groupRepository.save(group);

        // Optionally, notify all group members (except the updater) that the group details have been updated
        group.getMembers().forEach(member -> {
            if (!member.getId().equals(userId)) {
                notificationService.createNotification(new CreateNotificationDto(
                        "Group '" + updatedGroup.getName() + "' details have been updated.",
                        NotificationType.GROUP_UPDATED, // Ensure this type exists in your NotificationType enum
                        member.getId(),
                        null,
                        null
                ));
            }
        });

        return convertToDto(updatedGroup);
    }
    public String handleJoinRequest(Long userId, Long groupId) {
        Group group = getGroupById(groupId);
        User user = getUserById(userId);

        if (group.getMembers().contains(user)) {
            return "You are already a member of this group.";
        }

        if (!group.getVisibility().equals(Visibility.PRIVATE)) {
            // For public groups, add user immediately
            group.getMembers().add(user);
            groupRepository.save(group);
            // Notify user that they joined successfully
            notificationService.createNotification(new CreateNotificationDto(
                    "You have successfully joined the group '" + group.getName() + "'.",
                    NotificationType.GROUP_JOINED,
                    user.getId(),
                    null,
                    null
            ));
            return "Joined the group successfully!";
        } else {
            // For private groups, check for duplicate join requests
            if (group.getJoinRequests().contains(user)) {
                return "You have already requested to join this group.";
            }
            group.getJoinRequests().add(user);
            groupRepository.save(group);
            // Notify admins about the join request
            group.getAdmins().forEach(admin ->
                    notificationService.createNotification(new CreateNotificationDto(
                            user.getUsername() + " requested to join your group '" + group.getName() + "'.",
                            NotificationType.GROUP_JOIN_REQUEST,
                            admin.getId(),
                            null,
                            null
                    ))
            );
            return "Join request sent. Await admin approval.";
        }
    }

    public Set<RequestDto> getPendingJoinRequests(Long adminId, Long groupId) {
        Group group = getGroupById(groupId);
        User admin = getUserById(adminId);
        if (!group.getAdmins().contains(admin)) {
            throw new UnauthorizedActionException("You are not an admin of this group.");
        }
        return group.getJoinRequests().stream()
                .map(user -> new RequestDto(user.getId(), user.getUsername(), user.getEmail()))
                .collect(Collectors.toSet());
    }

    public String approveJoinRequest(Long adminId, Long userId, Long groupId) {
        Group group = getGroupById(groupId);
        User user = getUserById(userId);
        User admin = getUserById(adminId);

        if (!group.getAdmins().contains(admin)) {
            throw new UnauthorizedActionException("You are not an admin of this group.");
        }
        if (!group.getJoinRequests().contains(user)) {
            return "No pending join request from this user.";
        }

        group.getJoinRequests().remove(user);
        group.getMembers().add(user);
        groupRepository.save(group);

        // Notify the user that their join request was approved
        notificationService.createNotification(new CreateNotificationDto(
                "Your request to join the group '" + group.getName() + "' has been approved.",
                NotificationType.GROUP_JOIN_APPROVED,
                user.getId(),
                null,
                null
        ));

        return "Join request approved.";
    }

    public String leaveGroup(Long userId, Long groupId) {
        Group group = getGroupById(groupId);
        User user = getUserById(userId);
        if (!group.getMembers().contains(user)) {
            throw new UnauthorizedActionException("You are not a member of this group.");
        }
        group.getMembers().remove(user);
        groupRepository.save(group);

        // Notify all group admins that the user has left
        // (assuming getAdminIds() returns a list of admin user IDs)
        GroupResponseDto groupDto = GroupResponseDto.fromEntity(group);
        groupDto.getAdminIds().forEach(adminId -> {
            if (!adminId.equals(userId)) { // Avoid self-notification
                notificationService.createNotification(new CreateNotificationDto(
                        user.getUsername() + " left your group " + group.getName(),
                        NotificationType.GROUP_LEAVE,
                        adminId,
                        null,
                        null
                ));
            }
        });

        return "User left the group successfully";
    }


    public void rejectJoinRequest(Long groupId, Long userId) {
        Group group = getGroupById(groupId);
        User user = getUserById(userId);
        if (!group.getJoinRequests().contains(user)) {
            throw new ResourceNotFoundException("No pending request from this user");
        }
        group.getJoinRequests().remove(user);
        groupRepository.save(group);
        // Optionally notify the user that their request was rejected
        notificationService.createNotification(new CreateNotificationDto(
                "Your request to join the group '" + group.getName() + "' has been rejected.",
                NotificationType.GROUP_JOIN_REJECTED,
                user.getId(),
                null,
                null
        ));
    }

    public void deleteGroup(Long groupId, Long userId) {
        Group group = getGroupById(groupId);
        User user = getUserById(userId);
        if (!group.getMembers().contains(user)) {
            throw new UnauthorizedActionException("Only group members can delete the group.");
        }
        groupRepository.delete(group);
        // Notify all members that the group has been deleted
        group.getMembers().forEach(member ->
                notificationService.createNotification(new CreateNotificationDto(
                        "The group '" + group.getName() + "' has been deleted.",
                        NotificationType.GROUP_DELETED,
                        member.getId(),
                        null,
                        null
                ))
        );
    }

    public List<GroupResponseDto> getGroupsByCategory(Category category) {
        return groupRepository.findByCategory(category)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<GroupResponseDto> getUserGroups(Long userId) {
        User user = getUserById(userId);
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

    public GroupResponseDto getGroupByIdd(Long groupId) {
        Group group = getGroupById(groupId);
        return GroupResponseDto.fromEntity(group);
    }

    @Transactional
    public List<GroupResponseDto> getAllGroups() {
        return groupRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public void transferGroupOwnership(Long groupId, Long newOwnerId) {
        Group group = getGroupById(groupId);
        User newOwner = getUserById(newOwnerId);

        if (!group.getMembers().contains(newOwner)) {
            throw new UnauthorizedActionException("New owner must be a member of the group");
        }

        User previousOwner = group.getOwner();
        group.setOwner(newOwner);
        groupRepository.save(group);

        // Notify the new owner and the previous owner
        notificationService.createNotification(new CreateNotificationDto(
                "You are now the owner of group '" + group.getName() + "'.",
                NotificationType.GROUP_OWNERSHIP_TRANSFERRED,
                newOwner.getId(),
                null,
                null
        ));
        notificationService.createNotification(new CreateNotificationDto(
                "Ownership of group '" + group.getName() + "' has been transferred to " + newOwner.getUsername() + ".",
                NotificationType.GROUP_OWNERSHIP_TRANSFERRED,
                previousOwner.getId(),
                null,
                null
        ));
    }

    public List<UsersDto> getGroupMembers(Long groupId) {
        Group group = getGroupById(groupId);
        return group.getMembers().stream()
                .map(UsersDto::fromEntity)
                .collect(Collectors.toList());
    }

    public void removeUserFromGroup(Long groupId, Long userId) {
        Group group = getGroupById(groupId);
        User user = getUserById(userId);

        if (!group.getMembers().contains(user)) {
            throw new ResourceNotFoundException("User is not a member of this group");
        }

        group.getMembers().remove(user);
        groupRepository.save(group);
        // Notify the user about their removal
        notificationService.createNotification(new CreateNotificationDto(
                "You have been removed from group '" + group.getName() + "'.",
                NotificationType.GROUP_REMOVED,
                user.getId(),
                null,
                null
        ));
    }

    public void addUserToGroup(Long groupId, Long userId) {
        Group group = getGroupById(groupId);
        User user = getUserById(userId);

        if (group.getMembers().contains(user)) {
            throw new UnauthorizedActionException("User is already a member of this group");
        }

        group.getMembers().add(user);
        groupRepository.save(group);
        // Notify the user about being added to the group
        notificationService.createNotification(new CreateNotificationDto(
                "You have been added to group '" + group.getName() + "'.",
                NotificationType.GROUP_ADDED,
                user.getId(),
                null,
                null
        ));
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
