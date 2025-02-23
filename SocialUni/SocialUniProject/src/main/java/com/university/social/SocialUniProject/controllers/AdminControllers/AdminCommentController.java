package com.university.social.SocialUniProject.controllers.AdminControllers;

import com.university.social.SocialUniProject.dto.CommentDto.UpdateCommentDto;
import com.university.social.SocialUniProject.responses.CommentResponseDto;
import com.university.social.SocialUniProject.services.PostServices.CommentService;
import jakarta.validation.Valid;
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

    public AdminCommentController(CommentService commentService) {
        this.commentService = commentService;
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

    // 3️⃣ Update a comment as admin
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponseDto> updateCommentAsAdmin(@PathVariable Long commentId,
                                                                   @Valid @RequestBody UpdateCommentDto updateDto) {
        CommentResponseDto updatedComment = commentService.updateCommentAsAdmin(commentId, updateDto);
        return ResponseEntity.ok(updatedComment);
    }

    // 4️⃣ Delete a comment as admin
    @DeleteMapping("/{commentId}")
    public ResponseEntity<String> deleteComment(@PathVariable Long commentId, Authentication authentication) {
        // Retrieve admin's ID from authentication context if needed
        Long adminId = Long.parseLong(authentication.getName());
        commentService.deleteComment(adminId, commentId, true);
        return ResponseEntity.ok("Comment deleted successfully.");
    }
}
