package com.university.social.SocialUniProject.services.PostServices;

import com.university.social.SocialUniProject.dto.CommentDto.CreateCommentDto;
import com.university.social.SocialUniProject.dto.CommentDto.UpdateCommentDto;
import com.university.social.SocialUniProject.models.Comment;
import com.university.social.SocialUniProject.models.Enums.ReactionType;
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

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReactionRepository reactionRepository;

    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    public Comment getCommentById(Long commentId) {
        Optional<Comment> comment = commentRepository.findById(commentId);
        return comment.orElseThrow(() -> new RuntimeException("Comment not found"));
    }

    public CommentResponseDto createComment(Long userId, CreateCommentDto commentDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(commentDto.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

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
        comment.setCreatedAt(java.time.LocalDateTime.now());

        comment = commentRepository.save(comment);

        return convertToDto(comment);
    }

    public CommentResponseDto updateComment(Long userId, Long commentId, UpdateCommentDto updateDto) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only edit your own comments");
        }

        comment.setContent(updateDto.getContent());
        comment.setMediaUrl(updateDto.getMediaUrl());
        commentRepository.save(comment);

        return convertToDto(comment);
    }

    @Transactional
    public void deleteComment(Long userId, Long commentId, boolean isAdmin) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!isAdmin && !comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own comments");
        }

        comment.setDeleted(true);
        commentRepository.save(comment);
    }

    public List<CommentResponseDto> getCommentsForPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        List<Comment> comments = commentRepository.findByPostOrderByCreatedAtDesc(post);
        return comments.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<CommentResponseDto> getRepliesForComment(Long commentId) {
        Comment parentComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        List<Comment> replies = commentRepository.findByParentCommentOrderByCreatedAtDesc(parentComment);
        return replies.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    private CommentResponseDto convertToDto(Comment comment) {
        // Fetch reaction data for the comment
        List<Object[]> reactionResults = reactionRepository.findReactionTypeCountsByComment(comment.getId());

        // Convert List<Object[]> to Map<String, Integer>
        Map<String, Integer> reactionTypes = reactionResults.stream()
                .collect(Collectors.toMap(
                        row -> ((ReactionType) row[0]).name(), // Convert Enum to String
                        row -> ((Long) row[1]).intValue()
                ));

        // Calculate total reaction count
        int totalReactions = reactionTypes.values().stream().mapToInt(Integer::intValue).sum();

        // Fetch and map nested replies
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
                comment.isDeleted(),
                replies
        );
    }

}
