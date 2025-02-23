package com.university.social.SocialUniProject.services.PostServices;

import com.university.social.SocialUniProject.dto.PostDto.ReactionDto;
import com.university.social.SocialUniProject.models.Comment;
import com.university.social.SocialUniProject.models.Enums.ReactionType;
import com.university.social.SocialUniProject.models.Post;
import com.university.social.SocialUniProject.models.Reaction;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.repositories.CommentRepository;
import com.university.social.SocialUniProject.repositories.PostRepository;
import com.university.social.SocialUniProject.repositories.ReactionRepository;
import com.university.social.SocialUniProject.repositories.UserRepository;
import com.university.social.SocialUniProject.responses.ReactionResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReactionService {

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

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
    // --- Admin Methods ---

    // Helper: Convert Reaction to ReactionResponseDto
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

    // List all reactions (admin view)
    public List<ReactionResponseDto> getAllReactions() {
        return reactionRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Get reaction by ID
    public ReactionResponseDto getReactionById(Long reactionId) {
        Reaction reaction = reactionRepository.findById(reactionId)
                .orElseThrow(() -> new RuntimeException("Reaction not found"));
        return convertToDto(reaction);
    }

    // Delete a reaction as admin
    public void deleteReactionByAdmin(Long reactionId) {
        Reaction reaction = reactionRepository.findById(reactionId)
                .orElseThrow(() -> new RuntimeException("Reaction not found"));
        reactionRepository.delete(reaction);
    }

    // Filter reactions by type
    public List<ReactionResponseDto> getReactionsByType(ReactionType type) {
        List<Reaction> reactions = reactionRepository.findAll().stream()
                .filter(r -> r.getType().equals(type))
                .collect(Collectors.toList());
        return reactions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Get reaction statistics
    public Map<String, Object> getReactionStatistics() {
        Map<String, Object> stats = new HashMap<>();
        long totalReactions = reactionRepository.count();
        stats.put("totalReactions", totalReactions);

        // Count by ReactionType
        Map<String, Long> reactionCounts = reactionRepository.findAll().stream()
                .collect(Collectors.groupingBy(r -> r.getType().name(), Collectors.counting()));
        stats.put("reactionCounts", reactionCounts);

        // Breakdown: reactions on posts vs. comments
        long postReactions = reactionRepository.findAll().stream()
                .filter(r -> r.getPost() != null).count();
        long commentReactions = reactionRepository.findAll().stream()
                .filter(r -> r.getComment() != null).count();
        stats.put("postReactions", postReactions);
        stats.put("commentReactions", commentReactions);

        return stats;
    }
}
