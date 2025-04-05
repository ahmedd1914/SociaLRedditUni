package com.university.social.SocialUniProject.responses;

import com.university.social.SocialUniProject.enums.Category;
import com.university.social.SocialUniProject.enums.Visibility;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Getter
@Setter
public class PostResponseDto {
    private Long id;
    private String title;
    private String content;
    private Category category;
    private Visibility visibility;
    private String username;
    private LocalDateTime createdAt;
    private Long groupId;
    private int reactionCount;
    private Map<String, Integer> reactionTypes;
    private List<CommentResponseDto> comments;

    public PostResponseDto(Long id, String title, String content, Category category, Visibility visibility, String username, LocalDateTime createdAt, int reactionCount, Map<String, Integer> reactionTypes, List<CommentResponseDto> comments, Long groupId) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.category = category;
        this.visibility = visibility;
        this.username = username;
        this.createdAt = createdAt;
        this.reactionCount = reactionCount;
        this.reactionTypes = reactionTypes != null ? reactionTypes : new HashMap<>();
        this.comments = comments;
        this.groupId = groupId;
    }
}
