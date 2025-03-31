package com.university.social.SocialUniProject.dto;

import com.university.social.SocialUniProject.dto.UserDto.UsersDto;
import lombok.Data;
import java.util.List;

@Data
public class AdminStatsDto {
    private long totalUsers;
    private long totalPosts;
    private long totalComments;
    private long totalGroups;
    private long totalEvents;
    private long totalMessages;
    private long totalGroupRequests;
    private List<UsersDto> recentUsers;
} 