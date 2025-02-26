package com.university.social.SocialUniProject.controllers;

import com.university.social.SocialUniProject.dto.CreateCommentDto;
import com.university.social.SocialUniProject.dto.UpdateCommentDto;
import com.university.social.SocialUniProject.dto.CreateNotificationDto;
import com.university.social.SocialUniProject.enums.NotificationType;
import com.university.social.SocialUniProject.models.Post;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.responses.CommentResponseDto;
import com.university.social.SocialUniProject.services.NotificationService;
import com.university.social.SocialUniProject.services.PostServices.CommentService;
import com.university.social.SocialUniProject.services.PostServices.PostService;
import com.university.social.SocialUniProject.utils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/comments")
public class CommentController {

    private final CommentService commentService;
    private final PostService postService;
    private final NotificationService notificationService;

    @Autowired
    public CommentController(CommentService commentService,
                             PostService postService,
                             NotificationService notificationService) {
        this.commentService = commentService;
        this.postService = postService;
        this.notificationService = notificationService;
    }

    @PostMapping("/create")
    public ResponseEntity<CommentResponseDto> createComment(@RequestBody CreateCommentDto commentDto) {
        // Retrieve authenticated user ID from SecurityUtils
        Long userId = SecurityUtils.getAuthenticatedUserId();
        CommentResponseDto response = commentService.createComment(userId, commentDto);

        // Notify post owner if the comment is on someone else's post
        Post post = postService.getPostEntityById(commentDto.getPostId());
        if (!post.getUser().getId().equals(userId)) {
            notificationService.createNotification(new CreateNotificationDto(
                    "Someone commented on your post",
                    NotificationType.COMMENT,
                    post.getUser().getId(),
                    commentDto.getPostId(),
                    response.getId()
            ));
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{commentId}/edit")
    public ResponseEntity<CommentResponseDto> updateComment(@PathVariable Long commentId,
                                                            @RequestBody UpdateCommentDto updateDto) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        CommentResponseDto response = commentService.updateComment(userId, commentId, updateDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{commentId}/delete")
    public ResponseEntity<String> deleteComment(@PathVariable Long commentId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        // Check if user has ROLE_ADMIN if needed via SecurityUtils or in the service layer
        boolean isAdmin = SecurityUtils.hasRole("ROLE_ADMIN");
        commentService.deleteComment(userId, commentId, isAdmin);
        return ResponseEntity.ok("Comment deleted successfully");
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentResponseDto>> getCommentsForPost(@PathVariable Long postId) {
        List<CommentResponseDto> comments = commentService.getCommentsForPost(postId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/replies/{commentId}")
    public ResponseEntity<List<CommentResponseDto>> getRepliesForComment(@PathVariable Long commentId) {
        List<CommentResponseDto> replies = commentService.getRepliesForComment(commentId);
        return ResponseEntity.ok(replies);
    }
}
