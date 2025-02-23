package com.university.social.SocialUniProject.services;

import com.university.social.SocialUniProject.dto.ChatMessageDto;
import com.university.social.SocialUniProject.models.Message;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.repositories.MessageRepository;
import com.university.social.SocialUniProject.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    public Message saveMessage(ChatMessageDto chatMessageDto) {
        User sender = userRepository.findById(chatMessageDto.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(chatMessageDto.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        Message message = new Message(sender, receiver, chatMessageDto.getContent());
        message.setSentAt(chatMessageDto.getSentAt() != null ? chatMessageDto.getSentAt() : LocalDateTime.now());
        return messageRepository.save(message);
    }
    public List<Message> getConversation(Long userId1, Long userId2) {
        return messageRepository.findBySender_IdAndReceiver_IdOrSender_IdAndReceiver_IdOrderBySentAtAsc(
                userId1, userId2, userId2, userId1
        );
    }
    public void deleteMessageForSelf(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        // If the message is already deleted for everyone, there's nothing to do.
        if (message.isDeletedForAll()) {
            throw new RuntimeException("Message already deleted for everyone.");
        }

        // Add the user to the set of users for whom this message is deleted.
        message.getDeletedFor().add(userId);
        messageRepository.save(message);
    }
    public void deleteMessageForEveryone(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (message.getGroup() == null) {
            // For direct messages: only the sender or receiver may delete for everyone.
            if (!message.getSender().getId().equals(userId) &&
                    (message.getReceiver() == null || !message.getReceiver().getId().equals(userId))) {
                throw new RuntimeException("Unauthorized: Only sender or receiver can delete the message for everyone.");
            }
        } else {
            // For group chats: allow deletion for everyone if the user is the sender or is a group admin.
            // Check if the user is in the group's admins set.
            boolean isAdmin = message.getGroup().getAdmins()
                    .stream()
                    .anyMatch(admin -> admin.getId().equals(userId));
            if (!message.getSender().getId().equals(userId) && !isAdmin) {
                throw new RuntimeException("Unauthorized: Only sender or a group admin can delete the message for everyone.");
            }
        }

        // Mark the message as deleted for all and clear any soft-deletion records.
        message.setDeletedForAll(true);
        message.setDeletedFor(new HashSet<>());
        messageRepository.save(message);
    }
    public List<Message> getGroupChatMessages(Long groupId) {
        return messageRepository.findAll().stream()
                .filter(m -> m.getGroup() != null &&
                        m.getGroup().getId().equals(groupId) &&
                        !m.isDeletedForAll())
                .collect(Collectors.toList());
    }

    // Get messaging statistics for group chats
    public Map<String, Object> getGroupMessageStatistics(Long groupId) {
        List<Message> messages = getGroupChatMessages(groupId);
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMessages", messages.size());
        long deletedForEveryone = messages.stream().filter(Message::isDeletedForAll).count();
        stats.put("deletedForEveryone", deletedForEveryone);
        // Additional stats (e.g. messages per sender) can be added here.
        Map<String, Long> messagesBySender = messages.stream()
                .collect(Collectors.groupingBy(m -> m.getSender().getUsername(), Collectors.counting()));
        stats.put("messagesBySender", messagesBySender);
        return stats;
    }

}
