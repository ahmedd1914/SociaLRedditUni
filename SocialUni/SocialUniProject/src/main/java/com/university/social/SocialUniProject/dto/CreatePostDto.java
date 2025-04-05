package com.university.social.SocialUniProject.dto;

import com.university.social.SocialUniProject.enums.Category;
import com.university.social.SocialUniProject.enums.Visibility;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class CreatePostDto {
    private String title;
    private String content;
    private Category category;
    private Visibility visibility;
    
    @NotNull(message = "Group ID is required. Posts can only be created within groups.")
    private Long groupId;

    private String mediaUrl;
    private List<String> tags;
    private boolean allowComments = true; // Default to true
    private boolean isPinned = false; // Default to false

    public CreatePostDto(String title, String content, Category category, Visibility visibility, Long groupId) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.visibility = visibility;
        this.groupId = groupId;
        this.allowComments = true;
        this.isPinned = false;
    }

    public CreatePostDto(String title, String content, Category category, Visibility visibility, Long groupId,
                        String mediaUrl, List<String> tags, boolean allowComments, boolean isPinned) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.visibility = visibility;
        this.groupId = groupId;
        this.mediaUrl = mediaUrl;
        this.tags = tags;
        this.allowComments = allowComments;
        this.isPinned = isPinned;
    }

//    public String getTitle() {
//        return title;
//    }
//
//    public void setTitle(String title) {
//        this.title = title;
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
//    public Long getCategoryId() {
//        return categoryId;
//    }
//
//    public void setCategoryId(Long categoryId) {
//        this.categoryId = categoryId;
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
//    public Long getGroupId() {
//        return groupId;
//    }
//
//    public void setGroupId(Long groupId) {
//        this.groupId = groupId;
//    }
}
