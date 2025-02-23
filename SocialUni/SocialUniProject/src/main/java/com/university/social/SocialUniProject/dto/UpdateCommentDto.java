package com.university.social.SocialUniProject.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCommentDto {

    @NotBlank(message = "Comment content cannot be empty")
    private String content;

    private String mediaUrl;

    public UpdateCommentDto(String content, String mediaUrl) {
        this.content = content;
        this.mediaUrl = mediaUrl;
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