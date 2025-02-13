package com.university.social.SocialUniProject.dto.PostDto;

import com.university.social.SocialUniProject.models.Enums.ReactionType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReactionDto {
    @NotNull(message = "Reaction type cannot be null")
    private ReactionType type;

    private Long postId;
    private Long commentId;
}
