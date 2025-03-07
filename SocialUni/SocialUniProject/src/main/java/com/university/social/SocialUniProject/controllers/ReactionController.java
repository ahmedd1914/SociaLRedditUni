package com.university.social.SocialUniProject.controllers;

import com.university.social.SocialUniProject.dto.ReactionDto;
import com.university.social.SocialUniProject.exceptions.BadRequestException;
import com.university.social.SocialUniProject.services.PostServices.ReactionService;
import com.university.social.SocialUniProject.utils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reactions")
public class ReactionController {

    private final ReactionService reactionService;
    @Autowired
    public ReactionController(ReactionService reactionService) {
        this.reactionService = reactionService;
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

        // Process the reaction
        String response = reactionService.react(userId, reactionDto);

        return ResponseEntity.ok(response);
    }
}
