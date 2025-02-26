package com.university.social.SocialUniProject.controllers;

import com.university.social.SocialUniProject.models.Message;
import com.university.social.SocialUniProject.services.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/messages")
public class UserMessageController {

    @Autowired
    private MessageService messageService;

    // Get conversation history between two users (for direct messages)
    @GetMapping("/conversation")
    public ResponseEntity<?> getConversation(
            @RequestParam Long senderId,
            @RequestParam Long receiverId) {
        // Implement retrieval logic in messageService as needed
        return ResponseEntity.ok(messageService.getConversation(senderId, receiverId));
    }

    // Soft delete a message for the current user
    @DeleteMapping("/{messageId}/self")
    public ResponseEntity<Void> deleteMessageForSelf(@PathVariable Long messageId,
                                                     @RequestParam Long userId) {
        messageService.deleteMessageForSelf(messageId, userId);
        return ResponseEntity.noContent().build();
    }


}
