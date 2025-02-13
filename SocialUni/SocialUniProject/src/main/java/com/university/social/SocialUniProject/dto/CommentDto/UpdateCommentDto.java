package com.university.social.SocialUniProject.dto.CommentDto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCommentDto {

    @NotBlank(message = "Comment content cannot be empty")
    private String content;

    private String mediaUrl; }