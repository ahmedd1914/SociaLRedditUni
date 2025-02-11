package com.university.social.SocialUniProject.controllers;


import com.university.social.SocialUniProject.dto.PostDto.ReactionDto;
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

    @PostMapping("/react")
    public ResponseEntity<String> reactToPost(@RequestBody ReactionDto reactionDto) {
        if (reactionDto.getType() == null) {
            return ResponseEntity.badRequest().body("Reaction type cannot be null");
        }


        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Long userId = Long.parseLong(authentication.getName());
        String response = reactionService.reactToPost(userId, reactionDto);
        return ResponseEntity.ok(response);
    }
}
