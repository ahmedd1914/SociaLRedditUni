package com.university.social.SocialUniProject.responses;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class ReactionResponseDto {
    private Long id;
    private String type;
    private Long userId;
    private String username;
    private Long postId;
    private String postTitle;
    private Long commentId;
    private String commentContent;
    private Long commentAuthorId;
    private String commentAuthorUsername;
    private LocalDateTime timestamp;
}

