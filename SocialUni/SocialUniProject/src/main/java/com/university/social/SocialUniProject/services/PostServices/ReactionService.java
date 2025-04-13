package com.university.social.SocialUniProject.services.PostServices;

import com.university.social.SocialUniProject.dto.CreateNotificationDto;
import com.university.social.SocialUniProject.dto.ReactionDto;
import com.university.social.SocialUniProject.enums.NotificationType;
import com.university.social.SocialUniProject.enums.ReactionType;
import com.university.social.SocialUniProject.exceptions.ResourceNotFoundException;
import com.university.social.SocialUniProject.models.Comment;
import com.university.social.SocialUniProject.models.Post;
import com.university.social.SocialUniProject.models.Reaction;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.repositories.CommentRepository;
import com.university.social.SocialUniProject.repositories.PostRepository;
import com.university.social.SocialUniProject.repositories.ReactionRepository;
import com.university.social.SocialUniProject.repositories.UserRepository;
import com.university.social.SocialUniProject.responses.ReactionResponseDto;
import com.university.social.SocialUniProject.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import com.university.social.SocialUniProject.utils.SecurityUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReactionService {

    private static final Logger logger = LoggerFactory.getLogger(ReactionService.class);

    private final ReactionRepository reactionRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;

    /**
     * Processes a reaction from a user to either a post or a comment.
     * Returns a string message indicating whether the reaction was added, updated, or removed.
     */
    public String react(Long userId, ReactionDto reactionDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (reactionDto.getPostId() != null && reactionDto.getPostId() > 0) {
            return reactToPost(user, reactionDto);
        } else if (reactionDto.getCommentId() != null && reactionDto.getCommentId() > 0) {
            return reactToComment(user, reactionDto);
        } else {
            throw new IllegalArgumentException("Reaction must be associated with a valid post or comment.");
        }
    }

    private String reactToPost(User user, ReactionDto reactionDto) {
        Post post = postRepository.findById(reactionDto.getPostId())
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with ID: " + reactionDto.getPostId()));

        Optional<Reaction> existingReaction = reactionRepository.findByUserAndPost(user, post);
        if (existingReaction.isPresent()) {
            Reaction reaction = existingReaction.get();
            if (reaction.getType().equals(reactionDto.getType())) {
                // Remove reaction without notification
                reactionRepository.delete(reaction);
                logger.info("Removed reaction {} from post {} by user {}", reaction.getType(), post.getId(), user.getId());
                return "Reaction removed";
            } else {
                // Update reaction without notification
                reaction.setType(reactionDto.getType());
                reactionRepository.save(reaction);
                logger.info("Updated reaction on post {} by user {} to {}", post.getId(), user.getId(), reaction.getType());
                return "Reaction updated";
            }
        } else {
            // Add new reaction and notify
            Reaction newReaction = new Reaction(reactionDto.getType(), user, post);
            reactionRepository.save(newReaction);
            logger.info("Added reaction {} on post {} by user {}", newReaction.getType(), post.getId(), user.getId());
            
            // Only notify for new reactions
            if (!post.getUser().getId().equals(user.getId())) {
                notificationService.createNotification(new CreateNotificationDto(
                    String.format("%s reacted to your post", user.getUsername()),
                    NotificationType.POST_REACTED,
                    post.getUser().getId(),
                    post.getId(),
                    null
                ));
            }
            return "Reaction added";
        }
    }

    private String reactToComment(User user, ReactionDto reactionDto) {
        Comment comment = commentRepository.findById(reactionDto.getCommentId())
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with ID: " + reactionDto.getCommentId()));

        Optional<Reaction> existingReaction = reactionRepository.findByUserAndComment(user, comment);
        if (existingReaction.isPresent()) {
            Reaction reaction = existingReaction.get();
            if (reaction.getType().equals(reactionDto.getType())) {
                // Remove reaction without notification
                reactionRepository.delete(reaction);
                logger.info("Removed reaction {} from comment {} by user {}", reaction.getType(), comment.getId(), user.getId());
                return "Reaction removed";
            } else {
                // Update reaction without notification
                reaction.setType(reactionDto.getType());
                reactionRepository.save(reaction);
                logger.info("Updated reaction on comment {} by user {} to {}", comment.getId(), user.getId(), reaction.getType());
                return "Reaction updated";
            }
        } else {
            // Create new reaction
            Reaction newReaction = new Reaction();
            newReaction.setUser(user);
            newReaction.setComment(comment);
            newReaction.setType(reactionDto.getType());
            newReaction.setReactedAt(LocalDateTime.now());
            reactionRepository.save(newReaction);
            
            // Only notify for new reactions
            if (!comment.getUser().getId().equals(user.getId())) {
                String commentPreview = comment.getContent().length() > 50 ? 
                    comment.getContent().substring(0, 47) + "..." : 
                    comment.getContent();
                
                notificationService.createNotification(new CreateNotificationDto(
                    String.format("%s reacted to your comment: %s", user.getUsername(), commentPreview),
                    NotificationType.COMMENT_REACTED,
                    comment.getUser().getId(),
                    comment.getPost().getId(),
                    comment.getId()
                ));
            }
            
            logger.info("Added reaction {} to comment {} by user {}", reactionDto.getType(), comment.getId(), user.getId());
            return "Reaction added";
        }
    }

    // --- Admin / Utility Methods ---

    public ReactionResponseDto convertToDto(Reaction reaction) {
        ReactionResponseDto dto = new ReactionResponseDto();
        dto.setId(reaction.getId());
        dto.setType(reaction.getType().name());
        
        // Properly fetch user details from the reaction
        User reactionUser = reaction.getUser();
        if (reactionUser != null) {
            dto.setUserId(reactionUser.getId());
            dto.setUsername(reactionUser.getUsername());
        }
        
        if (reaction.getPost() != null) {
            dto.setPostId(reaction.getPost().getId());
            dto.setPostTitle(reaction.getPost().getTitle());
        }
        if (reaction.getComment() != null) {
            dto.setCommentId(reaction.getComment().getId());
            dto.setCommentContent(reaction.getComment().getContent());
            dto.setCommentAuthorId(reaction.getComment().getUser().getId());
            dto.setCommentAuthorUsername(reaction.getComment().getUser().getUsername());
        }
        dto.setTimestamp(reaction.getReactedAt());
        return dto;
    }

    public List<ReactionResponseDto> getAllReactions() {
        return reactionRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ReactionResponseDto getReactionById(Long reactionId) {
        Reaction reaction = reactionRepository.findById(reactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Reaction not found with ID: " + reactionId));
        return convertToDto(reaction);
    }

    public void deleteReactionByAdmin(Long reactionId) {
        Reaction reaction = reactionRepository.findById(reactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Reaction not found"));
        reactionRepository.delete(reaction);
    }

    public ReactionResponseDto addReactionAsAdmin(ReactionDto reactionDto) {
        // Get the user from the provided userId or fallback to authenticated user
        Long userId = reactionDto.getUserId() != null ? 
            reactionDto.getUserId() : 
            SecurityUtils.getAuthenticatedUserId();
            
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Check for existing reaction
        Optional<Reaction> existingReaction;
        if (reactionDto.getPostId() != null) {
            Post post = postRepository.findById(reactionDto.getPostId())
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
            existingReaction = reactionRepository.findByUserAndPost(user, post);
            
            if (existingReaction.isPresent()) {
                // Update existing reaction without notification
                Reaction reaction = existingReaction.get();
                reaction.setType(reactionDto.getType());
                reaction.setReactedAt(LocalDateTime.now());
                return convertToDto(reactionRepository.save(reaction));
            } else {
                // Create new reaction and notify
                Reaction newReaction = new Reaction();
                newReaction.setType(reactionDto.getType());
                newReaction.setUser(user);
                newReaction.setPost(post);
                newReaction.setReactedAt(LocalDateTime.now());
                Reaction savedReaction = reactionRepository.save(newReaction);

                // Only notify for new reactions
                if (!post.getUser().getId().equals(userId)) {
                    notificationService.createNotification(new CreateNotificationDto(
                        String.format("%s reacted to your post", user.getUsername()),
                        NotificationType.POST_REACTED,
                        post.getUser().getId(),
                        post.getId(),
                        null
                    ));
                }

                return convertToDto(savedReaction);
            }
        } else if (reactionDto.getCommentId() != null) {
            Comment comment = commentRepository.findById(reactionDto.getCommentId())
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
            existingReaction = reactionRepository.findByUserAndComment(user, comment);
            
            if (existingReaction.isPresent()) {
                // Update existing reaction without notification
                Reaction reaction = existingReaction.get();
                reaction.setType(reactionDto.getType());
                reaction.setReactedAt(LocalDateTime.now());
                return convertToDto(reactionRepository.save(reaction));
            } else {
                // Create new reaction and notify
                Reaction newReaction = new Reaction();
                newReaction.setType(reactionDto.getType());
                newReaction.setUser(user);
                newReaction.setComment(comment);
                newReaction.setReactedAt(LocalDateTime.now());
                Reaction savedReaction = reactionRepository.save(newReaction);

                // Only notify for new reactions
                if (!comment.getUser().getId().equals(userId)) {
                    String commentPreview = comment.getContent().length() > 50 ? 
                        comment.getContent().substring(0, 47) + "..." : 
                        comment.getContent();
                    
                    notificationService.createNotification(new CreateNotificationDto(
                        String.format("%s reacted to your comment: %s", user.getUsername(), commentPreview),
                        NotificationType.COMMENT_REACTED,
                        comment.getUser().getId(),
                        comment.getPost().getId(),
                        comment.getId()
                    ));
                }

                return convertToDto(savedReaction);
            }
        } else {
            throw new IllegalArgumentException("Either postId or commentId must be provided");
        }
    }

    public List<ReactionResponseDto> getReactionsByType(ReactionType type) {
        return reactionRepository.findByType(type)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ReactionResponseDto updateReactionAsAdmin(Long reactionId, ReactionType type) {
        Reaction reaction = reactionRepository.findById(reactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Reaction not found with ID: " + reactionId));
        
        reaction.setType(type);
        reaction = reactionRepository.save(reaction);
        
        return convertToDto(reaction);
    }

    public java.util.Map<String, Object> getReactionStatistics() {
        List<Reaction> allReactions = reactionRepository.findAll();
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalReactions", allReactions.size());

        java.util.Map<String, Long> reactionCounts = allReactions.stream()
                .collect(Collectors.groupingBy(r -> r.getType().name(), Collectors.counting()));
        stats.put("reactionCounts", reactionCounts);

        long postReactions = allReactions.stream().filter(r -> r.getPost() != null).count();
        long commentReactions = allReactions.stream().filter(r -> r.getComment() != null).count();
        stats.put("postReactions", postReactions);
        stats.put("commentReactions", commentReactions);

        return stats;
    }
}
