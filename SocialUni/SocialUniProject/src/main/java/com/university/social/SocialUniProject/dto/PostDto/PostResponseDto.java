package com.university.social.SocialUniProject.dto.PostDto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Getter
@Setter
public class PostResponseDto {
    private Long id;
    private String title;
    private String content;
    private String categoryName;
    private String username;
    private LocalDateTime createdAt;

    public PostResponseDto(Long id, String title, String content, String categoryName, String username, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.categoryName = categoryName;
        this.username = username;
        this.createdAt = createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public String getUsername() {
        return username;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
