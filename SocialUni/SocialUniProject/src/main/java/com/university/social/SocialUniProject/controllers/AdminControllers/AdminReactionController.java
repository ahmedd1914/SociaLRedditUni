package com.university.social.SocialUniProject.controllers.AdminControllers;

import com.university.social.SocialUniProject.enums.ReactionType;
import com.university.social.SocialUniProject.responses.ReactionResponseDto;
import com.university.social.SocialUniProject.services.PostServices.ReactionService;
import com.university.social.SocialUniProject.dto.ReactionDto;
import com.university.social.SocialUniProject.exceptions.BadRequestException;
import com.university.social.SocialUniProject.exceptions.ResourceNotFoundException;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.repositories.UserRepository;
import com.university.social.SocialUniProject.utils.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/reactions")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminReactionController {

    private final ReactionService reactionService;
    private final UserRepository userRepository;

    public AdminReactionController(
            ReactionService reactionService,
            UserRepository userRepository) {
        this.reactionService = reactionService;
        this.userRepository = userRepository;
    }

    // 1. Get all reactions
    @GetMapping
    public ResponseEntity<List<ReactionResponseDto>> getAllReactions() {
        List<ReactionResponseDto> reactions = reactionService.getAllReactions();
        return ResponseEntity.ok(reactions);
    }

    // 2. Get reaction by ID
    @GetMapping("/{reactionId}")
    public ResponseEntity<ReactionResponseDto> getReactionById(@PathVariable Long reactionId) {
        ReactionResponseDto reaction = reactionService.getReactionById(reactionId);
        return ResponseEntity.ok(reaction);
    }

    // 3. Delete a reaction as admin
    @DeleteMapping("/{reactionId}")
    public ResponseEntity<Void> deleteReaction(@PathVariable Long reactionId) {
        reactionService.deleteReactionByAdmin(reactionId);
        return ResponseEntity.noContent().build();
    }

    // 4. Add reaction as admin
    @PostMapping("/add")
    public ResponseEntity<ReactionResponseDto> addReactionAsAdmin(@RequestBody ReactionDto reactionDto) {
        // Validate input
        if (reactionDto.getType() == null) {
            throw new BadRequestException("Reaction type cannot be null.");
        }
        if (reactionDto.getPostId() == null && reactionDto.getCommentId() == null) {
            throw new BadRequestException("Reaction must be associated with a post or a comment.");
        }

        // Get the user from the provided userId or fallback to authenticated user
        Long userId = reactionDto.getUserId() != null ? 
            reactionDto.getUserId() : 
            SecurityUtils.getAuthenticatedUserId();
            
        User reactingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Process the reaction (notifications are handled in the service)
        ReactionResponseDto reaction = reactionService.addReactionAsAdmin(reactionDto);
        return ResponseEntity.ok(reaction);
    }

    // 5. Update reaction as admin
    @PutMapping("/{reactionId}")
    public ResponseEntity<ReactionResponseDto> updateReactionAsAdmin(
            @PathVariable Long reactionId,
            @RequestBody ReactionDto reactionDto) {
        ReactionResponseDto reaction = reactionService.updateReactionAsAdmin(reactionId, reactionDto.getType());
        return ResponseEntity.ok(reaction);
    }

    // 6. Get reaction statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getReactionStats() {
        Map<String, Object> stats = reactionService.getReactionStatistics();
        return ResponseEntity.ok(stats);
    }
}
