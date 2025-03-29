package com.university.social.SocialUniProject.services.PostServices;

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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CommentService {

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
        User user = getUserById(userId);
        Post post = getPostById(commentDto.getPostId());
        Comment parentComment = null;
        if (commentDto.getParentCommentId() != null) {
            parentComment = commentRepository.findById(commentDto.getParentCommentId())
                    .orElse(null);
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
        Comment comment = getCommentById(commentId);
        if (!isAdmin && !comment.getUser().getId().equals(userId)) {
            throw new UnauthorizedActionException("You can only delete your own comments");
        }
        // Set isDeleted to true instead of removing
        comment.setDeleted(true);
        commentRepository.save(comment);
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
                replies
        );
    }
}
