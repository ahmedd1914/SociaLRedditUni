package com.university.social.SocialUniProject.dto.PostDto;


import com.university.social.SocialUniProject.models.Enums.ReactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReactionDto {
    @NotBlank
    private ReactionType type; // Example: "LIKE", "LOVE", "HAHA", etc.

    @NotNull
    private Long postId;
}
