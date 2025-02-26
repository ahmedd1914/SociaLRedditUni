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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private PostService postService;

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/create")
    public ResponseEntity<CommentResponseDto> createComment(@RequestBody CreateCommentDto commentDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        Long userId = Long.parseLong(authentication.getName());
        CommentResponseDto response = commentService.createComment(userId, commentDto);

        // Fetch the post owner
        Post post = postService.getPostById(commentDto.getPostId());
        User postOwner = post.getUser();

        //  Send notification if user is commenting on someone else's post
        if (!postOwner.getId().equals(userId)) {
            notificationService.createNotification(new CreateNotificationDto(
                    "Someone commented on your post",
                    NotificationType.COMMENT,
                    postOwner.getId(),
                    commentDto.getPostId(),
                    response.getId()
            ));
        }

        return ResponseEntity.ok(response);
    }


    @PutMapping("/{commentId}/edit")
    public ResponseEntity<CommentResponseDto> updateComment(
            @PathVariable Long commentId,
            @RequestBody UpdateCommentDto updateDto) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        Long userId = Long.parseLong(authentication.getName());
        CommentResponseDto response = commentService.updateComment(userId, commentId, updateDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{commentId}/delete")
    public ResponseEntity<String> deleteComment(@PathVariable Long commentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        Long userId = Long.parseLong(authentication.getName());
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));

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
