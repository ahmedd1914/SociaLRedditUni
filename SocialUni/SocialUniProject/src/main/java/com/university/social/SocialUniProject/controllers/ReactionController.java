package com.university.social.SocialUniProject.controllers;

import com.university.social.SocialUniProject.dto.CreateNotificationDto;
import com.university.social.SocialUniProject.dto.ReactionDto;
import com.university.social.SocialUniProject.models.Comment;
import com.university.social.SocialUniProject.enums.NotificationType;
import com.university.social.SocialUniProject.models.Post;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.services.NotificationService;
import com.university.social.SocialUniProject.services.PostServices.CommentService;
import com.university.social.SocialUniProject.services.PostServices.PostService;
import com.university.social.SocialUniProject.services.PostServices.ReactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reactions")
public class ReactionController {

    @Autowired
    private ReactionService reactionService;
    @Autowired
    private PostService postService;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private CommentService commentService;

    @PostMapping("/react")
    public ResponseEntity<String> react(@RequestBody ReactionDto reactionDto) {
        if (reactionDto.getType() == null) {
            return ResponseEntity.badRequest().body("Reaction type cannot be null");
        }

        if (reactionDto.getPostId() == null && reactionDto.getCommentId() == null) {
            return ResponseEntity.badRequest().body("Reaction must be associated with a post or a comment");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Long userId = Long.parseLong(authentication.getName());
        String response = reactionService.react(userId, reactionDto);

        // ✅ Notify post owner if reacting to a post
        if (reactionDto.getPostId() != null) {
            Post post = postService.getPostById(reactionDto.getPostId());
            User postOwner = post.getUser();

            if (!postOwner.getId().equals(userId)) { // Prevent self-notifications
                notificationService.createNotification(new CreateNotificationDto(
                        "Someone reacted to your post",
                        NotificationType.REACTION,
                        postOwner.getId(),
                        reactionDto.getPostId(),
                        null
                ));
            }
        }

        // ✅ Notify comment owner if reacting to a comment
        if (reactionDto.getCommentId() != null) {
            Comment comment = commentService.getCommentById(reactionDto.getCommentId());
            User commentOwner = comment.getUser();

            if (!commentOwner.getId().equals(userId)) {
                notificationService.createNotification(new CreateNotificationDto(
                        "Someone reacted to your comment",
                        NotificationType.REACTION,
                        commentOwner.getId(),
                        null,
                        reactionDto.getCommentId()
                ));
            }
        }

        return ResponseEntity.ok(response);
    }
}
