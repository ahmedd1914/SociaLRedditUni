package com.university.social.SocialUniProject.services.GroupServices;

import com.university.social.SocialUniProject.dto.GroupDto.CreateGroupDto;
import com.university.social.SocialUniProject.responses.GroupResponseDto;
import com.university.social.SocialUniProject.models.Enums.Category;
import com.university.social.SocialUniProject.models.Group;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.repositories.GroupRepository;
import com.university.social.SocialUniProject.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    public GroupResponseDto createGroup(CreateGroupDto groupDto, Long userId) {
        Group group = new Group();
        group.setName(groupDto.getName());
        group.setDescription(groupDto.getDescription());
        group.setPrivate(groupDto.isPrivate());
        group.setCategory(groupDto.getCategory());
        Group savedGroup = groupRepository.save(group);
        return convertToDto(savedGroup);
    }

    public String joinGroup(Long userId, Long groupId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        group.getMembers().add(user);
        groupRepository.save(group);
        return "User joined the group successfully";
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
}
