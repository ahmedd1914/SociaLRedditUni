package com.university.social.SocialUniProject.dto;

import com.university.social.SocialUniProject.enums.ReactionType;
import lombok.Data;

@Data
public class CreateReactionDto {
    private Long postId;
    private Long commentId;
    private ReactionType type;
} 