package com.university.social.SocialUniProject.controllers;

import com.university.social.SocialUniProject.dto.ReactionDto;
import com.university.social.SocialUniProject.exceptions.BadRequestException;
import com.university.social.SocialUniProject.exceptions.ResourceNotFoundException;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.models.Post;
import com.university.social.SocialUniProject.models.Reaction;
import com.university.social.SocialUniProject.models.Comment;
import com.university.social.SocialUniProject.services.PostServices.ReactionService;
import com.university.social.SocialUniProject.repositories.UserRepository;
import com.university.social.SocialUniProject.repositories.PostRepository;
import com.university.social.SocialUniProject.repositories.ReactionRepository;
import com.university.social.SocialUniProject.repositories.CommentRepository;
import com.university.social.SocialUniProject.responses.ReactionResponseDto;
import com.university.social.SocialUniProject.utils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/reactions")
public class ReactionController {

    private final ReactionService reactionService;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ReactionRepository reactionRepository;
    private final CommentRepository commentRepository;

    @Autowired
    public ReactionController(ReactionService reactionService,
                            UserRepository userRepository,
                            PostRepository postRepository,
                            ReactionRepository reactionRepository,
                            CommentRepository commentRepository) {
        this.reactionService = reactionService;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.reactionRepository = reactionRepository;
        this.commentRepository = commentRepository;
    }

    @PostMapping("/react")
    public ResponseEntity<String> react(@RequestBody ReactionDto reactionDto) {
        // Validate input
        if (reactionDto.getType() == null) {
            throw new BadRequestException("Reaction type cannot be null.");
        }
        if (reactionDto.getPostId() == null && reactionDto.getCommentId() == null) {
            throw new BadRequestException("Reaction must be associated with a post or a comment.");
        }

        // Get authenticated user ID from the SecurityUtils helper
        Long userId = SecurityUtils.getAuthenticatedUserId();
        User reactingUser = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Process the reaction (notifications are handled in the service)
        String response = reactionService.react(userId, reactionDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/post/{postId}")
    public ResponseEntity<ReactionResponseDto> getUserReactionForPost(@PathVariable Long postId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
            
        Optional<Reaction> reaction = reactionRepository.findByUserAndPost(user, post);
        if (reaction.isPresent()) {
            return ResponseEntity.ok(reactionService.convertToDto(reaction.get()));
        }
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/user/post/{postId}")
    public ResponseEntity<Void> removeUserReactionFromPost(@PathVariable Long postId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
            
        Optional<Reaction> reaction = reactionRepository.findByUserAndPost(user, post);
        if (reaction.isPresent()) {
            reactionRepository.delete(reaction.get());
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/user/comment/{commentId}")
    public ResponseEntity<ReactionResponseDto> getUserReactionForComment(@PathVariable Long commentId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
            
        Optional<Reaction> reaction = reactionRepository.findByUserAndComment(user, comment);
        if (reaction.isPresent()) {
            return ResponseEntity.ok(reactionService.convertToDto(reaction.get()));
        }
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/user/comment/{commentId}")
    public ResponseEntity<Void> removeUserReactionFromComment(@PathVariable Long commentId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
            
        Optional<Reaction> reaction = reactionRepository.findByUserAndComment(user, comment);
        if (reaction.isPresent()) {
            reactionRepository.delete(reaction.get());
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/comment/{commentId}")
    public ResponseEntity<String> reactToComment(
            @PathVariable Long commentId,
            @RequestBody ReactionDto reactionDto) {
        // Validate input
        if (reactionDto.getType() == null) {
            throw new BadRequestException("Reaction type cannot be null.");
        }

        // Get authenticated user ID
        Long userId = SecurityUtils.getAuthenticatedUserId();
        User reactingUser = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Set the comment ID in the DTO
        reactionDto.setCommentId(commentId);

        // Process the reaction
        String response = reactionService.react(userId, reactionDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/comment/{commentId}")
    public ResponseEntity<Void> removeCommentReaction(@PathVariable Long commentId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
            
        Optional<Reaction> reaction = reactionRepository.findByUserAndComment(user, comment);
        if (reaction.isPresent()) {
            reactionRepository.delete(reaction.get());
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
