package com.university.social.SocialUniProject.services.PostServices;

import com.university.social.SocialUniProject.dto.ReactionDto;
import com.university.social.SocialUniProject.models.*;
import com.university.social.SocialUniProject.enums.ReactionType;
import com.university.social.SocialUniProject.repositories.CommentRepository;
import com.university.social.SocialUniProject.repositories.PostRepository;
import com.university.social.SocialUniProject.repositories.ReactionRepository;
import com.university.social.SocialUniProject.repositories.UserRepository;
import com.university.social.SocialUniProject.responses.ReactionResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReactionService {

    private final ReactionRepository reactionRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    public String react(Long userId, ReactionDto reactionDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (reactionDto.getPostId() != null && reactionDto.getPostId() > 0) {
            return reactToPost(user, reactionDto);
        } else if (reactionDto.getCommentId() != null && reactionDto.getCommentId() > 0) {
            return reactToComment(user, reactionDto);
        } else {
            throw new RuntimeException("Reaction must be associated with a valid post or comment.");
        }
    }

    private String reactToPost(User user, ReactionDto reactionDto) {
        Post post = postRepository.findById(reactionDto.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Optional<Reaction> existingReaction = reactionRepository.findByUserAndPost(user, post);

        if (existingReaction.isPresent()) {
            Reaction reaction = existingReaction.get();
            if (reaction.getType().equals(reactionDto.getType())) {
                reactionRepository.delete(reaction); // Remove reaction if it's the same type
                return "Reaction removed";
            } else {
                reaction.setType(reactionDto.getType());
                reactionRepository.save(reaction); // Update reaction type
                return "Reaction updated";
            }
        } else {
            Reaction newReaction = new Reaction(reactionDto.getType(), user, post);
            reactionRepository.save(newReaction);
            return "Reaction added";
        }
    }

    private String reactToComment(User user, ReactionDto reactionDto) {
        Comment comment = commentRepository.findById(reactionDto.getCommentId())
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        Optional<Reaction> existingReaction = reactionRepository.findByUserAndComment(user, comment);

        if (existingReaction.isPresent()) {
            Reaction reaction = existingReaction.get();
            if (reaction.getType().equals(reactionDto.getType())) {
                reactionRepository.delete(reaction); // Remove reaction if it's the same type
                return "Reaction removed";
            } else {
                reaction.setType(reactionDto.getType());
                reactionRepository.save(reaction); // Update reaction type
                return "Reaction updated";
            }
        } else {
            Reaction newReaction = new Reaction(reactionDto.getType(), user, comment);
            reactionRepository.save(newReaction);
            return "Reaction added";
        }
    }

    // --- Admin / Utility Methods ---

    public ReactionResponseDto convertToDto(Reaction reaction) {
        ReactionResponseDto dto = new ReactionResponseDto();
        dto.setId(reaction.getId());
        dto.setType(reaction.getType().name());
        dto.setUserId(reaction.getUser().getId());
        if (reaction.getPost() != null) {
            dto.setPostId(reaction.getPost().getId());
        }
        if (reaction.getComment() != null) {
            dto.setCommentId(reaction.getComment().getId());
        }
        dto.setReactedAt(reaction.getReactedAt());
        return dto;
    }

    public List<ReactionResponseDto> getAllReactions() {
        return reactionRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ReactionResponseDto getReactionById(Long reactionId) {
        Reaction reaction = reactionRepository.findById(reactionId)
                .orElseThrow(() -> new RuntimeException("Reaction not found"));
        return convertToDto(reaction);
    }

    public void deleteReactionByAdmin(Long reactionId) {
        Reaction reaction = reactionRepository.findById(reactionId)
                .orElseThrow(() -> new RuntimeException("Reaction not found"));
        reactionRepository.delete(reaction);
    }

    public List<ReactionResponseDto> getReactionsByType(ReactionType type) {
        return reactionRepository.findByType(type).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }


    public Map<String, Object> getReactionStatistics() {
        List<Reaction> allReactions = reactionRepository.findAll(); // Single DB call

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalReactions", allReactions.size());

        // Count by ReactionType
        Map<String, Long> reactionCounts = allReactions.stream()
                .collect(Collectors.groupingBy(r -> r.getType().name(), Collectors.counting()));
        stats.put("reactionCounts", reactionCounts);

        // Breakdown: reactions on posts vs. comments
        long postReactions = allReactions.stream().filter(r -> r.getPost() != null).count();
        long commentReactions = allReactions.stream().filter(r -> r.getComment() != null).count();
        stats.put("postReactions", postReactions);
        stats.put("commentReactions", commentReactions);

        return stats;
    }
}
