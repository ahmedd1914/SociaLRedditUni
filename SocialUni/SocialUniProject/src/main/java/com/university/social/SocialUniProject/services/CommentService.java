package com.university.social.SocialUniProject.services;

import com.university.social.SocialUniProject.dto.CreateCommentDto;
import com.university.social.SocialUniProject.dto.UpdateCommentDto;
import com.university.social.SocialUniProject.exceptions.ResourceNotFoundException;
import com.university.social.SocialUniProject.exceptions.UnauthorizedActionException;
import com.university.social.SocialUniProject.models.Comment;
import com.university.social.SocialUniProject.enums.ReactionType;
import com.university.social.SocialUniProject.models.Post;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.repositories.CommentRepository;
import com.university.social.SocialUniProject.repositories.PostRepository;
import com.university.social.SocialUniProject.repositories.ReactionRepository;
import com.university.social.SocialUniProject.repositories.UserRepository;
import com.university.social.SocialUniProject.responses.CommentResponseDto;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CommentService {
    private static final Logger logger = LoggerFactory.getLogger(CommentService.class);

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final ReactionRepository reactionRepository;

    @Autowired
    public CommentService(CommentRepository commentRepository,
                          PostRepository postRepository,
                          UserRepository userRepository,
                          ReactionRepository reactionRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.reactionRepository = reactionRepository;

    }

    // Helper method to fetch a User by ID
    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    // Helper method to fetch a Post by ID
    private Post getPostById(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
    }

    public Comment getCommentById(Long commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
    }

    public CommentResponseDto createComment(Long userId, CreateCommentDto commentDto) {
        logger.debug("[CommentService] Creating new comment - User ID: {}, Post ID: {}, Parent Comment ID: {}", 
            userId, commentDto.getPostId(), commentDto.getParentCommentId());
        
        User user = getUserById(userId);
        Post post = getPostById(commentDto.getPostId());
        Comment parentComment = null;
        
        if (commentDto.getParentCommentId() != null) {
            logger.debug("[CommentService] Fetching parent comment with ID: {}", commentDto.getParentCommentId());
            parentComment = commentRepository.findById(commentDto.getParentCommentId())
                    .orElse(null);
            if (parentComment == null) {
                logger.warn("[CommentService] Parent comment not found with ID: {}", commentDto.getParentCommentId());
            } else {
                logger.debug("[CommentService] Found parent comment - ID: {}, Author: {}", 
                    parentComment.getId(), parentComment.getUser().getUsername());
            }
        }

        Comment comment = new Comment();
        comment.setContent(commentDto.getContent());
        comment.setUser(user);
        comment.setPost(post);
        comment.setParentComment(parentComment);
        comment.setVisibility(commentDto.getVisibility());
        comment.setMediaUrl(commentDto.getMediaUrl());
        comment.setCreatedAt(LocalDateTime.now());

        comment = commentRepository.save(comment);
        logger.info("[CommentService] Comment created successfully - ID: {}, Author: {}, Content length: {}", 
            comment.getId(), comment.getUser().getUsername(), comment.getContent().length());

        return convertToDto(comment);
    }

    public CommentResponseDto updateComment(Long userId, Long commentId, UpdateCommentDto updateDto) {
        Comment comment = getCommentById(commentId);
        if (!comment.getUser().getId().equals(userId)) {
            throw new UnauthorizedActionException("You can only edit your own comments");
        }
        comment.setContent(updateDto.getContent());
        comment.setMediaUrl(updateDto.getMediaUrl());
        commentRepository.save(comment);
        return convertToDto(comment);
    }

    @Transactional
    public void deleteComment(Long userId, Long commentId, boolean isAdmin) {
        logger.debug("[CommentService] Deleting comment - User ID: {}, Comment ID: {}, Is Admin: {}", 
            userId, commentId, isAdmin);
        
        Comment comment = getCommentById(commentId);
        logger.debug("[CommentService] Found comment to delete - ID: {}, Author: {}, Content length: {}", 
            comment.getId(), comment.getUser().getUsername(), comment.getContent().length());
        
        if (!isAdmin && !comment.getUser().getId().equals(userId)) {
            logger.warn("[CommentService] Unauthorized deletion attempt - User ID: {}, Comment Author ID: {}", 
                userId, comment.getUser().getId());
            throw new UnauthorizedActionException("You can only delete your own comments");
        }
        
        // Set isDeleted to true instead of removing
        comment.setDeleted(true);
        commentRepository.save(comment);
        logger.info("[CommentService] Comment marked as deleted - ID: {}", commentId);
    }

    @Transactional
    public void permanentlyDeleteComment(Long commentId) {
        logger.debug("[CommentService] Starting permanent deletion of comment - ID: {}", commentId);
        
        Comment comment = getCommentById(commentId);
        logger.debug("[CommentService] Found comment to permanently delete - ID: {}, Author: {}, Content length: {}", 
            comment.getId(), comment.getUser().getUsername(), comment.getContent().length());
        
        // First, delete all child comments (replies)
        List<Comment> replies = commentRepository.findByParentCommentId(commentId);
        logger.debug("[CommentService] Found {} replies to delete", replies.size());
        
        for (Comment reply : replies) {
            logger.debug("[CommentService] Recursively deleting reply - ID: {}, Author: {}", 
                reply.getId(), reply.getUser().getUsername());
            // Recursively delete replies
            permanentlyDeleteComment(reply.getId());
        }
        
        // Then delete the comment itself
        commentRepository.delete(comment);
        logger.info("[CommentService] Comment permanently deleted - ID: {}", commentId);
    }

    public List<CommentResponseDto> getCommentsForPost(Long postId) {
        Post post = getPostById(postId);
        return commentRepository.findByPostOrderByCreatedAtDesc(post)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<CommentResponseDto> getRepliesForComment(Long commentId) {
        Comment parentComment = getCommentById(commentId);
        return commentRepository.findByParentCommentOrderByCreatedAtDesc(parentComment)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<CommentResponseDto> getAllComments() {
        // Return all comments with their deletion status
        return commentRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<CommentResponseDto> getAllActiveComments() {
        // Only fetch comments where isDeleted is false
        return commentRepository.findByIsDeletedFalse()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public CommentResponseDto updateCommentAsAdmin(Long commentId, UpdateCommentDto updateDto) {
        Comment comment = getCommentById(commentId);
        comment.setContent(updateDto.getContent());
        comment.setMediaUrl(updateDto.getMediaUrl());
        if (updateDto.getVisibility() != null) {
            comment.setVisibility(updateDto.getVisibility());
        }
        commentRepository.save(comment);
        return convertToDto(comment);
    }

    public CommentResponseDto getCommentResponseById(Long commentId) {
        return convertToDto(getCommentById(commentId));
    }

    private CommentResponseDto convertToDto(Comment comment) {
        // Fetch reaction data for the comment
        List<Object[]> reactionResults = reactionRepository.findReactionTypeCountsByComment(comment.getId());
        Map<String, Integer> reactionTypes = reactionResults.stream()
                .collect(Collectors.toMap(
                        row -> ((ReactionType) row[0]).name(),
                        row -> ((Long) row[1]).intValue()
                ));
        int totalReactions = reactionTypes.values().stream().mapToInt(Integer::intValue).sum();
        List<CommentResponseDto> replies = commentRepository.findByParentCommentId(comment.getId())
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return new CommentResponseDto(
                comment.getId(),
                comment.getUser().getUsername(),
                comment.getContent(),
                comment.getMediaUrl(),
                comment.getVisibility(),
                comment.getCreatedAt(),
                totalReactions,
                reactionTypes,
                (comment.getParentComment() != null) ? comment.getParentComment().getId() : null,
                comment.isDeleted(), // Make sure this is included
                replies,
                comment.getPost().getId()
        );
    }
}

