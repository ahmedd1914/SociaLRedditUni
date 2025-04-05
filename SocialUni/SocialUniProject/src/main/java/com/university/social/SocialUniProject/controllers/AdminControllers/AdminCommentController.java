package com.university.social.SocialUniProject.controllers.AdminControllers;

import com.university.social.SocialUniProject.dto.CreateNotificationDto;
import com.university.social.SocialUniProject.dto.UpdateCommentDto;
import com.university.social.SocialUniProject.enums.NotificationType;
import com.university.social.SocialUniProject.models.Comment;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.responses.CommentResponseDto;
import com.university.social.SocialUniProject.responses.GenericDeleteResponse;
import com.university.social.SocialUniProject.services.CommentService;
import com.university.social.SocialUniProject.services.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/comments")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminCommentController {

    private final CommentService commentService;
    private final NotificationService notificationService;

    public AdminCommentController(CommentService commentService, NotificationService notificationService) {
        this.commentService = commentService;
        this.notificationService = notificationService;
    }

    // 1️⃣ Get all comments (admin dashboard)
    @GetMapping
    public ResponseEntity<List<CommentResponseDto>> getAllComments() {
        List<CommentResponseDto> comments = commentService.getAllComments();
        return ResponseEntity.ok(comments);
    }

    // 2️⃣ Get a comment by ID
    @GetMapping("/{commentId}")
    public ResponseEntity<CommentResponseDto> getCommentById(@PathVariable Long commentId) {
        CommentResponseDto comment = commentService.getCommentResponseById(commentId);
        return ResponseEntity.ok(comment);
    }
    @GetMapping("/active_comments")
    public ResponseEntity<List<CommentResponseDto>> getActiveComments() {
        List<CommentResponseDto> comments = commentService.getAllActiveComments();
        return ResponseEntity.ok(comments);
    }


    // 3️⃣ Update a comment as admin
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponseDto> updateCommentAsAdmin(@PathVariable Long commentId,
                                                                   @Valid @RequestBody UpdateCommentDto updateDto) {
        CommentResponseDto updatedComment = commentService.updateCommentAsAdmin(commentId, updateDto);
        
        // Get the comment to notify the author
        Comment comment = commentService.getCommentById(commentId);
        
        // Notify the comment author that an admin updated their comment
        String commentPreview = comment.getContent().length() > 50 ? 
            comment.getContent().substring(0, 47) + "..." : 
            comment.getContent();
        
        notificationService.createNotification(new CreateNotificationDto(
            String.format("An admin updated your comment: %s", commentPreview),
            NotificationType.COMMENT_UPDATED,
            comment.getUser().getId(),
            comment.getPost().getId(),
            commentId
        ));

        return ResponseEntity.ok(updatedComment);
    }

   @DeleteMapping("/{commentId}")
    public ResponseEntity<GenericDeleteResponse> deleteComment(@PathVariable Long commentId, Authentication authentication) {
        try {
            System.out.println("[DEBUG] Starting soft deletion process for comment ID: " + commentId);
            
            User admin = (User) authentication.getPrincipal();
            Long adminId = admin.getId();
            System.out.println("[DEBUG] Admin ID performing deletion: " + adminId);
            
            // Get the comment before deletion to notify the author
            Comment comment = commentService.getCommentById(commentId);
            System.out.println("[DEBUG] Found comment to delete: " + comment.getId());
            System.out.println("[DEBUG] Comment current status - isDeleted: " + comment.isDeleted());
            
            // Delete the comment
            commentService.deleteComment(adminId, commentId, true);
            System.out.println("[DEBUG] Comment marked as deleted in database");
            
            // Notify the comment author that an admin deleted their comment
            String commentPreview = comment.getContent().length() > 50 ? 
                comment.getContent().substring(0, 47) + "..." : 
                comment.getContent();
            
            notificationService.createNotification(new CreateNotificationDto(
                String.format("An admin deleted your comment: %s", commentPreview),
                NotificationType.COMMENT_DELETED,
                comment.getUser().getId(),
                comment.getPost().getId(),
                commentId
            ));
            System.out.println("[DEBUG] Notification sent to comment author");
            
            System.out.println("[DEBUG] Soft deletion completed successfully for comment: " + commentId);
            return ResponseEntity.ok(new GenericDeleteResponse(true, "Comment marked as deleted successfully."));
        } catch (Exception e) {
            System.err.println("[DEBUG] Error during soft deletion of comment " + commentId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new GenericDeleteResponse(false, "Failed to delete comment: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{commentId}/permanent")
    public ResponseEntity<GenericDeleteResponse> permanentlyDeleteComment(@PathVariable Long commentId, Authentication authentication) {
        try {
            System.out.println("[DEBUG] Starting permanent deletion process for comment ID: " + commentId);
            
            User admin = (User) authentication.getPrincipal();
            Long adminId = admin.getId();
            System.out.println("[DEBUG] Admin ID performing permanent deletion: " + adminId);
            
            // Get the comment before deletion to notify the author
            Comment comment = commentService.getCommentById(commentId);
            System.out.println("[DEBUG] Found comment to permanently delete: " + comment.getId());
            System.out.println("[DEBUG] Comment current status - isDeleted: " + comment.isDeleted());
            
            // Permanently delete the comment
            commentService.permanentlyDeleteComment(commentId);
            System.out.println("[DEBUG] Comment permanently deleted from database");
            
            // Notify the comment author that an admin permanently deleted their comment
            String commentPreview = comment.getContent().length() > 50 ? 
                comment.getContent().substring(0, 47) + "..." : 
                comment.getContent();
            
            notificationService.createNotification(new CreateNotificationDto(
                String.format("An admin permanently deleted your comment: %s", commentPreview),
                NotificationType.COMMENT_DELETED,
                comment.getUser().getId(),
                comment.getPost().getId(),
                commentId
            ));
            System.out.println("[DEBUG] Notification sent to comment author");
            
            System.out.println("[DEBUG] Permanent deletion completed successfully for comment: " + commentId);
            return ResponseEntity.ok(new GenericDeleteResponse(true, "Comment permanently deleted from database."));
        } catch (Exception e) {
            System.err.println("[DEBUG] Error during permanent deletion of comment " + commentId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new GenericDeleteResponse(false, "Failed to permanently delete comment: " + e.getMessage()));
        }
    }
}
