package com.university.social.SocialUniProject.responses;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class ReactionResponseDto {
    private Long id;
    private String type;
    private Long userId;
    private Long postId;
    private Long commentId;
    private LocalDateTime reactedAt;
}

