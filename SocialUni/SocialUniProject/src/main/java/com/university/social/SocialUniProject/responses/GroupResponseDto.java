package com.university.social.SocialUniProject.responses;

import com.university.social.SocialUniProject.enums.Category;
import com.university.social.SocialUniProject.enums.Visibility;
import com.university.social.SocialUniProject.models.Group;
import lombok.Getter;
import lombok.Setter;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class GroupResponseDto {
    private Long id;
    private String name;
    private String description;
    private int memberCount;
    private Visibility visibility;
    private Category category;
    private Long ownerId;
    private List<Long> adminIds;
    private List<Long> memberIds;

    // ✅ Fixed Constructor Order & Formatting
    public GroupResponseDto(Long id, String name, String description, int memberCount, Visibility visibility,
                            Category category, Long ownerId, List<Long> adminIds, List<Long> memberIds) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.memberCount = memberCount;
        this.visibility = visibility;
        this.category = category;
        this.ownerId = ownerId;
        this.adminIds = adminIds;
        this.memberIds = memberIds;
    }

    // ✅ Static Factory Method - Fixed Null Checks
    public static GroupResponseDto fromEntity(Group group) {
        return new GroupResponseDto(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getMembers() != null ? group.getMembers().size() : 0, // Safe Null Check
                group.getVisibility(),
                group.getCategory(),
                group.getOwner() != null ? group.getOwner().getId() : null, // Prevent NullPointerException

                // ✅ Safe handling of Admins & Members
                group.getAdmins() != null
                        ? group.getAdmins().stream().map(admin -> admin.getId()).collect(Collectors.toList())
                        : Collections.emptyList(),
                group.getMembers() != null
                        ? group.getMembers().stream().map(member -> member.getId()).collect(Collectors.toList())
                        : Collections.emptyList()
        );
    }
}
