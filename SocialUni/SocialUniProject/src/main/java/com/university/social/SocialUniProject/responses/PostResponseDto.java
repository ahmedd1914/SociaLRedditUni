package com.university.social.SocialUniProject.responses;

import com.university.social.SocialUniProject.models.Reaction;
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
    private String categoryName;
    private String username;
    private LocalDateTime createdAt;
    private int reactionCount;
    private Map<String, Integer> reactionTypes;
    private List<CommentResponseDto> commments;

    public PostResponseDto(Long id, String title, String content, String categoryName, String username, LocalDateTime createdAt, int reactionCount, Map<String, Integer> reactionTypes, List<CommentResponseDto> commments) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.categoryName = categoryName;
        this.username = username;
        this.createdAt = createdAt;
        this.reactionCount = reactionCount;
        this.reactionTypes = reactionTypes != null ? reactionTypes : new HashMap<>();
        this.commments = commments;
    }

//    public void setId(Long id) {
//        this.id = id;
//    }
//
//    public void setTitle(String title) {
//        this.title = title;
//    }
//
//    public void setContent(String content) {
//        this.content = content;
//    }
//
//    public void setCategoryName(String categoryName) {
//        this.categoryName = categoryName;
//    }
//
//    public void setUsername(String username) {
//        this.username = username;
//    }
//
//    public void setCreatedAt(LocalDateTime createdAt) {
//        this.createdAt = createdAt;
//    }
//
//    public Long getId() {
//        return id;
//    }
//
//    public String getTitle() {
//        return title;
//    }
//
//    public String getContent() {
//        return content;
//    }
//
//    public String getCategoryName() {
//        return categoryName;
//    }
//
//    public String getUsername() {
//        return username;
//    }
//
//    public LocalDateTime getCreatedAt() {
//        return createdAt;
//    }
//
//    public int getReactionCount() {
//        return reactionCount;
//    }
//
//    public void setReactionCount(int reactionCount) {
//        this.reactionCount = reactionCount;
//    }
//
//    public Map<String, Integer> getReactionTypes() {
//        return reactionTypes;
//    }
//
//    public void setReactionTypes(Map<String, Integer> reactionTypes) {
//        this.reactionTypes = reactionTypes;
//    }
//
//    public List<CommentResponseDto> getCommments() {
//        return commments;
//    }
//
//    public void setCommments(List<CommentResponseDto> commments) {
//        this.commments = commments;
//    }
}
