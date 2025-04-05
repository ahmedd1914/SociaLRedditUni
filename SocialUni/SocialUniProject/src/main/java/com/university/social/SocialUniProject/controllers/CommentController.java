package com.university.social.SocialUniProject.controllers;

import com.university.social.SocialUniProject.dto.CreateCommentDto;
import com.university.social.SocialUniProject.dto.UpdateCommentDto;
import com.university.social.SocialUniProject.dto.CreateNotificationDto;
import com.university.social.SocialUniProject.enums.NotificationType;
import com.university.social.SocialUniProject.models.Post;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.models.Comment;
import com.university.social.SocialUniProject.responses.CommentResponseDto;
import com.university.social.SocialUniProject.services.NotificationService;
import com.university.social.SocialUniProject.services.CommentService;
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
        
        // First, create the comment
        CommentResponseDto response = commentService.createComment(userId, commentDto);
        
        // Then fetch the complete comment entity for notification purposes
        Comment comment = commentService.getCommentById(response.getId());
        User commentAuthor = comment.getUser();

        // If this is a reply to another comment, notify the parent comment author first
        if (commentDto.getParentCommentId() != null) {
            Comment parentComment = commentService.getCommentById(commentDto.getParentCommentId());
            User parentCommentAuthor = parentComment.getUser();
            
            // Only notify if the reply is not from the same user as the parent comment
            if (!parentCommentAuthor.getId().equals(userId)) {
                String commentPreview = comment.getContent().length() > 50 ? 
                    comment.getContent().substring(0, 47) + "..." : 
                    comment.getContent();
                
                notificationService.createNotification(new CreateNotificationDto(
                    String.format("%s replied to your comment: %s", commentAuthor.getUsername(), commentPreview),
                    NotificationType.COMMENT_REPLIED,
                    parentCommentAuthor.getId(),
                    comment.getPost().getId(),
                    comment.getId()
                ));
            }
        }

        // Then notify post owner if the comment is on someone else's post
        Post post = postService.getPostEntityById(commentDto.getPostId());
        User postOwner = post.getUser();
        
        // Only notify if the comment is not from the post owner
        if (!postOwner.getId().equals(userId)) {
            String commentPreview = comment.getContent().length() > 50 ? 
                comment.getContent().substring(0, 47) + "..." : 
                comment.getContent();
            
            notificationService.createNotification(new CreateNotificationDto(
                String.format("%s commented on your post: %s", commentAuthor.getUsername(), commentPreview),
                NotificationType.POST_COMMENTED,
                postOwner.getId(),
                post.getId(),
                comment.getId()
            ));
        }

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponseDto> updateComment(
            @PathVariable Long commentId,
            @RequestBody UpdateCommentDto commentDto) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        CommentResponseDto response = commentService.updateComment(userId, commentId, commentDto);
        Comment comment = commentService.getCommentById(commentId);
        User commentAuthor = comment.getUser();
        
        // Notify post owner about the comment update
        Post post = postService.getPostEntityById(comment.getPost().getId());
        User postOwner = post.getUser();
        
        if (!postOwner.getId().equals(userId)) {
            String commentPreview = comment.getContent().length() > 50 ? 
                comment.getContent().substring(0, 47) + "..." : 
                comment.getContent();
            
            notificationService.createNotification(new CreateNotificationDto(
                String.format("%s updated their comment on your post: %s", commentAuthor.getUsername(), commentPreview),
                NotificationType.COMMENT_UPDATED,
                postOwner.getId(),
                post.getId(),
                commentId
            ));
        }

        // Notify parent comment author about the reply update
        if (comment.getParentComment() != null) {
            User parentCommentAuthor = comment.getParentComment().getUser();
            if (!parentCommentAuthor.getId().equals(userId)) {
                String commentPreview = comment.getContent().length() > 50 ? 
                    comment.getContent().substring(0, 47) + "..." : 
                    comment.getContent();
                
                notificationService.createNotification(new CreateNotificationDto(
                    String.format("%s updated their reply to your comment: %s", commentAuthor.getUsername(), commentPreview),
                    NotificationType.COMMENT_UPDATED,
                    parentCommentAuthor.getId(),
                    post.getId(),
                    commentId
                ));
            }
        }

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        Comment comment = commentService.getCommentById(commentId);
        Post post = postService.getPostEntityById(comment.getPost().getId());
        User commentAuthor = comment.getUser();
        
        // Create notifications before deleting the comment
        User postOwner = post.getUser();
        if (!postOwner.getId().equals(userId)) {
            notificationService.createNotification(new CreateNotificationDto(
                String.format("%s deleted their comment on your post", commentAuthor.getUsername()),
                NotificationType.COMMENT_DELETED,
                postOwner.getId(),
                post.getId(),
                commentId
            ));
        }

        if (comment.getParentComment() != null) {
            User parentCommentAuthor = comment.getParentComment().getUser();
            if (!parentCommentAuthor.getId().equals(userId)) {
                notificationService.createNotification(new CreateNotificationDto(
                    String.format("%s deleted their reply to your comment", commentAuthor.getUsername()),
                    NotificationType.COMMENT_DELETED,
                    parentCommentAuthor.getId(),
                    post.getId(),
                    commentId
                ));
            }
        }

        commentService.deleteComment(userId, commentId, false); // false for regular user deletion
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentResponseDto>> getCommentsForPost(@PathVariable Long postId) {
        List<CommentResponseDto> comments = commentService.getCommentsForPost(postId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/{commentId}/replies")
    public ResponseEntity<List<CommentResponseDto>> getRepliesForComment(@PathVariable Long commentId) {
        List<CommentResponseDto> replies = commentService.getRepliesForComment(commentId);
        return ResponseEntity.ok(replies);
    }
}
