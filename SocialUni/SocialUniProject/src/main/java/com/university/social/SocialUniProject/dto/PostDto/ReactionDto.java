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


//    public @NotNull(message = "Reaction type cannot be null") ReactionType getType() {
//        return type;
//    }
//
//    public void setType(@NotNull(message = "Reaction type cannot be null") ReactionType type) {
//        this.type = type;
//    }
//
//    public Long getPostId() {
//        return postId;
//    }
//
//    public void setPostId(Long postId) {
//        this.postId = postId;
//    }
//
//    public Long getCommentId() {
//        return commentId;
//    }
//
//    public void setCommentId(Long commentId) {
//        this.commentId = commentId;
//    }
}
