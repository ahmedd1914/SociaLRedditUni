package com.university.social.SocialUniProject.dto;

import com.university.social.SocialUniProject.enums.ReactionType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ReactionDto {
    @NotNull(message = "Reaction type cannot be null")
    private ReactionType type;

    private Long postId;
    private Long commentId;
    private Long userId;


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
