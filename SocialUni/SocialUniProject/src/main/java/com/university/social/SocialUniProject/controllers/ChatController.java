package com.university.social.SocialUniProject.controllers;

import com.university.social.SocialUniProject.dto.ChatMessageDto;
import com.university.social.SocialUniProject.models.Message;
import com.university.social.SocialUniProject.services.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessageService messageService;

    @MessageMapping("/chat")
    public void processMessage(ChatMessageDto chatMessageDto, Principal principal) {
        // The principal now contains the authenticated user's ID (as a String)
        Long senderId = Long.parseLong(principal.getName());
        chatMessageDto.setSenderId(senderId);

        // Persist the message
        Message savedMessage = messageService.saveMessage(chatMessageDto);
        chatMessageDto.setSentAt(savedMessage.getSentAt());

        // Send the message to the receiver's personal queue
        messagingTemplate.convertAndSendToUser(
                chatMessageDto.getReceiverId().toString(),
                "/queue/messages",
                chatMessageDto);
    }
}
