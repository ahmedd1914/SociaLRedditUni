package com.university.social.SocialUniProject.controllers.AdminControllers;

import com.university.social.SocialUniProject.models.Message;
import com.university.social.SocialUniProject.services.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/group-messages")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminMessageController {

    private final MessageService messageService;

    public AdminMessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    // 1. Get all messages in a specific group chat
    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Message>> getGroupChatMessages(@PathVariable Long groupId) {
        List<Message> messages = messageService.getGroupChatMessages(groupId);
        return ResponseEntity.ok(messages);
    }

    // 2. Hard-delete a message for everyone (admin action)
    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessageForEveryone(@PathVariable Long messageId, @RequestParam Long adminId) {
        // Assume adminId is the authenticated admin’s ID (or extract from security context)
        messageService.deleteMessageForEveryone(messageId, adminId);
        return ResponseEntity.noContent().build();
    }

    // 3. Get messaging statistics for a group chat
    @GetMapping("/group/{groupId}/stats")
    public ResponseEntity<Map<String, Object>> getGroupMessageStats(@PathVariable Long groupId) {
        Map<String, Object> stats = messageService.getGroupMessageStatistics(groupId);
        return ResponseEntity.ok(stats);
    }
}
