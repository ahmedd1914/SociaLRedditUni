package com.university.social.SocialUniProject.controllers.AdminControllers;

import com.university.social.SocialUniProject.enums.ReactionType;
import com.university.social.SocialUniProject.responses.ReactionResponseDto;
import com.university.social.SocialUniProject.services.PostServices.ReactionService;
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

    public AdminReactionController(ReactionService reactionService) {
        this.reactionService = reactionService;
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


    // 5. Get reaction statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getReactionStats() {
        Map<String, Object> stats = reactionService.getReactionStatistics();
        return ResponseEntity.ok(stats);
    }
}
