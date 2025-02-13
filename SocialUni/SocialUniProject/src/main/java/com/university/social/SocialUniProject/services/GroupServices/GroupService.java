package com.university.social.SocialUniProject.services.GroupServices;

import com.university.social.SocialUniProject.dto.CreateNotificationDto;
import com.university.social.SocialUniProject.dto.GroupDto.CreateGroupDto;
import com.university.social.SocialUniProject.dto.RequestDto;
import com.university.social.SocialUniProject.models.Enums.NotificationType;
import com.university.social.SocialUniProject.responses.GroupResponseDto;
import com.university.social.SocialUniProject.models.Enums.Category;
import com.university.social.SocialUniProject.models.Group;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.repositories.GroupRepository;
import com.university.social.SocialUniProject.repositories.UserRepository;
import com.university.social.SocialUniProject.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
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
        group.setPrivate(groupDto.isPrivate());
        group.setCategory(groupDto.getCategory());

        // ✅ Add creator as a member and admin
        group.getMembers().add(creator);
        group.getAdmins().add(creator);

        // ✅ Save the group with creator as member and admin
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

        if (!group.isPrivate()) {
            // ✅ If public, join immediately
            if (group.getMembers().contains(user)) {
                return "You are already a member of this group.";
            }
            group.getMembers().add(user);
            groupRepository.save(group);
            return "Joined the group successfully!";
        } else {
            // ✅ If private, send a join request
            if (group.getJoinRequests().contains(user)) {
                return "You have already requested to join this group.";
            }
            group.getJoinRequests().add(user);
            groupRepository.save(group);

            // ✅ Notify admins about the request
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

        if (!group.getAdmins().contains(userRepository.findById(adminId).orElse(null))) {
            throw new RuntimeException("You are not an admin of this group.");
        }

        // ✅ Convert Users to UserDto to avoid sensitive data
        return group.getJoinRequests().stream()
                .map(user -> new RequestDto(user.getId(), user.getUsername(), user.getEmail()))
                .collect(Collectors.toSet());
    }

    public String approveJoinRequest(Long adminId, Long userId, Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!group.getAdmins().contains(userRepository.findById(adminId).orElse(null))) {
            throw new RuntimeException("You are not an admin of this group.");
        }

        if (!group.getJoinRequests().contains(user)) {
            return "No pending join request from this user.";
        }

        // ✅ Remove from join requests and add to the group
        group.getJoinRequests().remove(user);
        group.getMembers().add(user);
        groupRepository.save(group);

        return "Join request approved.";
    }


    public String leaveGroup(Long userId, Long groupId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        group.getMembers().remove(user);
        groupRepository.save(group);
        return "User left the group successfully";
    }

    public void deleteGroup(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));
        if (!group.getMembers().contains(userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found")))) {
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
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return user.getGroups().stream().map(this::convertToDto).collect(Collectors.toList());
    }
    public List<GroupResponseDto> getPublicGroups() {
        return groupRepository.findByIsPrivateFalse().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<GroupResponseDto> getPublicGroupsSortedByMembers() {
        return groupRepository.findAll().stream()
                .sorted(Comparator.comparingInt(group -> -group.getMembers().size())) // Sort descending by members count
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    private GroupResponseDto convertToDto(Group group) {
        return new GroupResponseDto(group.getId(), group.getName(), group.getDescription(),
                group.isPrivate(), group.getCategory(),
                group.getMembers().stream().map(User::getId).collect(Collectors.toSet()));
    }

    public Group getGroupById(Long groupId) {
        Optional<Group> group = groupRepository.findById(groupId);
        return group.orElseThrow(() -> new RuntimeException("Group not found"));
    }
    public void saveGroup(Group group) {
        groupRepository.save(group);
    }

}
