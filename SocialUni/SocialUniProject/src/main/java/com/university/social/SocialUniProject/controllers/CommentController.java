package com.university.social.SocialUniProject.controllers;


import com.university.social.SocialUniProject.dto.CommentDto.CreateCommentDto;
import com.university.social.SocialUniProject.dto.CommentDto.UpdateCommentDto;
import com.university.social.SocialUniProject.responses.CommentResponseDto;
import com.university.social.SocialUniProject.services.PostServices.CommentService;
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

    @PostMapping("/create")
    public ResponseEntity<CommentResponseDto> createComment(@RequestBody CreateCommentDto commentDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        Long userId = Long.parseLong(authentication.getName());
        CommentResponseDto response = commentService.createComment(userId, commentDto);
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
