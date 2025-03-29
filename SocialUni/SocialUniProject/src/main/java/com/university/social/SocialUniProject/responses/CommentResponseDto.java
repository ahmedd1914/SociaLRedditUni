package com.university.social.SocialUniProject.responses;

import com.university.social.SocialUniProject.models.Comment;
import com.university.social.SocialUniProject.enums.Visibility;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Getter
@Setter
public class CommentResponseDto {
    private Long id;
    private String username;
    private String content;
    private String mediaUrl;
    private Visibility visibility;
    private LocalDateTime createdAt;
    private int reactionCount;
    private Map<String, Integer> reactionTypes;
    private Long parentCommentId; // If it's a reply
    private boolean isDeleted;
    private List<CommentResponseDto> replies;

    public CommentResponseDto(Long id, String username, String content, String mediaUrl, Visibility visibility, LocalDateTime createdAt, int reactionCount, Map<String, Integer> reactionTypes, Long parentCommentId, boolean isDeleted, List<CommentResponseDto> replies) {
        this.id = id;
        this.username = username;
        this.content = content;
        this.mediaUrl = mediaUrl;
        this.visibility = visibility;
        this.createdAt = createdAt;
        this.reactionCount = reactionCount;
        this.reactionTypes = reactionTypes != null ? reactionTypes : new HashMap<>();
        this.parentCommentId = parentCommentId;
        this.isDeleted = isDeleted;
        this.replies = replies;
    }

    }

