package com.university.social.SocialUniProject.services.PostServices;

import com.university.social.SocialUniProject.dto.PostDto.CreatePostDto;
import com.university.social.SocialUniProject.repositories.CommentRepository;
import com.university.social.SocialUniProject.responses.CommentResponseDto;
import com.university.social.SocialUniProject.responses.PostResponseDto;
import com.university.social.SocialUniProject.models.*;
import com.university.social.SocialUniProject.models.Enums.Category;
import com.university.social.SocialUniProject.models.Enums.ReactionType;
import com.university.social.SocialUniProject.models.Enums.Visibility;
import com.university.social.SocialUniProject.repositories.PostRepository;
import com.university.social.SocialUniProject.repositories.ReactionRepository;
import com.university.social.SocialUniProject.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private CommentRepository commentRepository;

    public PostResponseDto createPost(CreatePostDto postDto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));


        if (postDto.getCategoryId() == null || postDto.getCategoryId() < 0 || postDto.getCategoryId() >= Category.values().length) {
            throw new RuntimeException("Invalid category ID: " + postDto.getCategoryId());
        }

        Post post = new Post();
        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setUser(user);
        post.setVisibility(postDto.getVisibility());
        post.setCreatedAt(LocalDateTime.now()); // Ensure createdAt is set

        Category category = Category.values()[postDto.getCategoryId().intValue()];
        post.setCategories(Set.of(category));


        Post savedPost = postRepository.save(post);

        if (savedPost.getId() == null) {
            throw new RuntimeException("Failed to save post");
        }

        return convertToDto(savedPost);
    }


    public List<PostResponseDto> getAllPublicPosts() {
        List<Post> posts = postRepository.findByVisibility(Visibility.PUBLIC);
        return posts.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public PostResponseDto updatePost(Long postId, CreatePostDto postDto, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only edit your own posts.");
        }

        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setVisibility(postDto.getVisibility());

        Post updatedPost = postRepository.save(post);
        System.out.println("Post updated successfully: " + updatedPost.getId());

        return convertToDto(updatedPost);
    }

    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own posts.");
        }

        postRepository.delete(post);
        System.out.println("Post deleted successfully: " + postId);
    }

    private PostResponseDto convertToDto(Post post) {
        List<Object[]> reactionResults = reactionRepository.findReactionTypeCountsByPost(post.getId());

        Map<String, Integer> reactionTypes = reactionResults.stream()
                .collect(Collectors.toMap(
                        row -> ((ReactionType) row[0]).name(), // Convert Enum to String
                        row -> ((Long) row[1]).intValue()
                ));

        int totalReactions = reactionTypes.values().stream().mapToInt(Integer::intValue).sum();

        String categoryNames = post.getCategories() != null && !post.getCategories().isEmpty()
                ? post.getCategories().stream().map(Enum::name).collect(Collectors.joining(", "))
                : "Uncategorized";

        List<CommentResponseDto> comments = commentRepository.findByPostIdAndParentCommentIsNull(post.getId())
                .stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());

        return new PostResponseDto(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                categoryNames,
                post.getUser().getUsername(),
                post.getCreatedAt(),
                totalReactions,
                reactionTypes,
                comments
        );
    }

    private CommentResponseDto mapToCommentResponse(Comment comment) {

        List<CommentResponseDto> replies = commentRepository.findByParentCommentId(comment.getId())
                .stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());

        // Convert reaction types
        Map<String, Integer> reactionTypes = comment.getReactions().stream()
                .collect(Collectors.groupingBy(reaction -> reaction.getType().name(), Collectors.summingInt(r -> 1)));

        return new CommentResponseDto(
                comment.getId(),
                comment.getContent(),
                comment.getUser().getUsername(),
                comment.getMediaUrl(),
                comment.getVisibility(),
                comment.getCreatedAt(),
                comment.getReactions().size(),
                reactionTypes,
                comment.getParentComment() != null ? comment.getParentComment().getId() : null,
                comment.isDeleted(),
                replies
        );
    }

}
