package com.university.social.SocialUniProject.responses;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class PostMetricsDto {
    private PostResponseDto latestPost;
    private PostResponseDto mostReactedPost;
    private PostResponseDto mostCommentedPost;
}
