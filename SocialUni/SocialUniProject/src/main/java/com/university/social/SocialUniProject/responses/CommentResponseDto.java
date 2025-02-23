package com.university.social.SocialUniProject.responses;

import com.university.social.SocialUniProject.models.Enums.Visibility;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

//    public Long getId() {
//        return id;
//    }
//
//    public void setId(Long id) {
//        this.id = id;
//    }
//
//    public String getUsername() {
//        return username;
//    }
//
//    public void setUsername(String username) {
//        this.username = username;
//    }
//
//    public String getContent() {
//        return content;
//    }
//
//    public void setContent(String content) {
//        this.content = content;
//    }
//
//    public String getMediaUrl() {
//        return mediaUrl;
//    }
//
//    public void setMediaUrl(String mediaUrl) {
//        this.mediaUrl = mediaUrl;
//    }
//
//    public Visibility getVisibility() {
//        return visibility;
//    }
//
//    public void setVisibility(Visibility visibility) {
//        this.visibility = visibility;
//    }
//
//    public LocalDateTime getCreatedAt() {
//        return createdAt;
//    }
//
//    public void setCreatedAt(LocalDateTime createdAt) {
//        this.createdAt = createdAt;
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
//    public Long getParentCommentId() {
//        return parentCommentId;
//    }
//
//    public void setParentCommentId(Long parentCommentId) {
//        this.parentCommentId = parentCommentId;
//    }
//
//    public boolean isDeleted() {
//        return isDeleted;
//    }
//
//    public void setDeleted(boolean deleted) {
//        isDeleted = deleted;
//    }
//
//    public List<CommentResponseDto> getReplies() {
//        return replies;
//    }
//
//    public void setReplies(List<CommentResponseDto> replies) {
//        this.replies = replies;
//    }
}
