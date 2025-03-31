package com.university.social.SocialUniProject.dto;

import lombok.Data;
import java.util.Map;

@Data
public class ReactionStatsDto {
    private long totalReactions;
    private String mostCommonReaction;
    private long recentReactionsCount;
    private Map<String, Long> reactionsByType;
} 