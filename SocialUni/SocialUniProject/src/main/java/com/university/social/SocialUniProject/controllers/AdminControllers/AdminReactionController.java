package com.university.social.SocialUniProject.controllers.AdminControllers;

import com.university.social.SocialUniProject.enums.ReactionType;
import com.university.social.SocialUniProject.responses.ReactionResponseDto;
import com.university.social.SocialUniProject.services.PostServices.ReactionService;
import com.university.social.SocialUniProject.dto.ReactionDto;
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

    // 4. Add reaction as admin
    @PostMapping("/add")
    public ResponseEntity<ReactionResponseDto> addReactionAsAdmin(@RequestBody ReactionDto reactionDto) {
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
