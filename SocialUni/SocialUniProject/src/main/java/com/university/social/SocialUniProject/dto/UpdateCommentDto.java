package com.university.social.SocialUniProject.dto;

import com.university.social.SocialUniProject.enums.Visibility;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCommentDto {

    @NotBlank(message = "Comment content cannot be empty")
    private String content;

    private String mediaUrl;

    private Visibility visibility;

    public UpdateCommentDto(String content, String mediaUrl, Visibility visibility) {
        this.content = content;
        this.mediaUrl = mediaUrl;
        this.visibility = visibility;
    }

//    public @NotBlank(message = "Comment content cannot be empty") String getContent() {
//        return content;
//    }
//
//    public void setContent(@NotBlank(message = "Comment content cannot be empty") String content) {
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
}