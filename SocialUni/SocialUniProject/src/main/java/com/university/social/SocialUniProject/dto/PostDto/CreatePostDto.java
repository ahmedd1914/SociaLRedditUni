package com.university.social.SocialUniProject.dto.PostDto;

import com.university.social.SocialUniProject.models.Enums.Visibility;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreatePostDto {
    private String title;
    private String content;
    private Long categoryId;
    private Visibility visibility;
    private Long groupId;


    public CreatePostDto(String title, String content, Long categoryId, Visibility visibility, Long groupId) {
        this.title = title;
        this.content = content;
        this.categoryId = categoryId;
        this.visibility = visibility;
        this.groupId = groupId;
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
