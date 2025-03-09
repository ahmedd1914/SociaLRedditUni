package com.university.social.SocialUniProject.services.PostServices;

import com.university.social.SocialUniProject.dto.CreatePostDto;
import com.university.social.SocialUniProject.enums.Category;
import com.university.social.SocialUniProject.enums.NotificationType;
import com.university.social.SocialUniProject.enums.ReactionType;
import com.university.social.SocialUniProject.enums.Visibility;
import com.university.social.SocialUniProject.exceptions.ResourceNotFoundException;
import com.university.social.SocialUniProject.exceptions.UnauthorizedActionException;
import com.university.social.SocialUniProject.models.Comment;
import com.university.social.SocialUniProject.models.Group;
import com.university.social.SocialUniProject.models.Post;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.repositories.*;
import com.university.social.SocialUniProject.responses.CommentResponseDto;
import com.university.social.SocialUniProject.responses.PostMetricsDto;
import com.university.social.SocialUniProject.responses.PostResponseDto;
import com.university.social.SocialUniProject.services.NotificationService;
import com.university.social.SocialUniProject.dto.CreateNotificationDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final ReactionRepository reactionRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;
    private final GroupRepository groupRepository;

    @Autowired
    public PostService(PostRepository postRepository,
                       UserRepository userRepository,
                       ReactionRepository reactionRepository,
                       CommentRepository commentRepository,
                       NotificationService notificationService, GroupRepository groupRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.reactionRepository = reactionRepository;
        this.commentRepository = commentRepository;
        this.notificationService = notificationService;
        this.groupRepository = groupRepository;
    }

    // ---------- Helper Methods ----------

    private Post findPostById(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with ID: " + postId));
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
    }

    // ---------- Public Methods ----------

    /**
     * Returns the Post entity directly
     */
    public Post getPostEntityById(Long postId) {
        return findPostById(postId);
    }

    /**
     * Returns a PostResponseDto by ID
     */
    public PostResponseDto getPostByIdDto(Long postId) {
        Post post = findPostById(postId);
        return convertToDto(post);
    }

    public PostResponseDto createPost(CreatePostDto postDto, Long userId) {
        User user = findUserById(userId);

        // Validate category
        if (postDto.getCategory() == null) {
            throw new ResourceNotFoundException("Invalid category: null");
        }

        Post post = new Post();
        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setUser(user);
        post.setVisibility(postDto.getVisibility());
        post.setCreatedAt(LocalDateTime.now());

        // Category is a single enum
        post.setCategories(postDto.getCategory());

        // 1) Check if groupId was provided
        if (postDto.getGroupId() != null) {
            // 2) Fetch the group
            Group group = groupRepository.findById(postDto.getGroupId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Group not found with ID: " + postDto.getGroupId()));
            // 3) Set the group on the post
            post.setGroup(group);
        }

        Post savedPost = postRepository.save(post);
        if (savedPost.getId() == null) {
            throw new ResourceNotFoundException("Failed to save post");
        }

        // Notify user that their post was created (if you have such logic)
        notificationService.createNotification(new CreateNotificationDto(
                "Your post '" + savedPost.getTitle() + "' has been created.",
                NotificationType.POST_CREATED,
                userId,
                savedPost.getId(),
                null
        ));

        return convertToDto(savedPost);
    }


    public List<PostResponseDto> getAllPublicPosts() {
        return postRepository.findByVisibility(Visibility.PUBLIC)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public PostResponseDto updatePost(Long postId, CreatePostDto postDto, Long userId) {
        Post post = findPostById(postId);
        if (!post.getUser().getId().equals(userId)) {
            throw new UnauthorizedActionException("You can only edit your own posts.");
        }

        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setVisibility(postDto.getVisibility());

        Post updatedPost = postRepository.save(post);

        // Notify user that their post was updated
        notificationService.createNotification(new CreateNotificationDto(
                "Your post '" + updatedPost.getTitle() + "' has been updated.",
                NotificationType.POST_UPDATED,
                userId,
                updatedPost.getId(),
                null
        ));

        return convertToDto(updatedPost);
    }

    public void deletePost(Long postId, Long userId) {
        Post post = findPostById(postId);
        if (!post.getUser().getId().equals(userId)) {
            throw new UnauthorizedActionException("You can only delete your own posts.");
        }
        postRepository.delete(post);

        // Notify user that their post was deleted
        notificationService.createNotification(new CreateNotificationDto(
                "Your post '" + post.getTitle() + "' has been deleted.",
                NotificationType.POST_DELETED,
                userId,
                postId,
                null
        ));
    }

    // ---------- Admin Methods ----------

    public List<PostResponseDto> getAllPosts() {
        return postRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public PostResponseDto getPostResponseDtoById(Long postId) {
        Post post = findPostById(postId);
        return convertToDto(post);
    }

    public PostResponseDto updatePostByAdmin(Long postId, CreatePostDto postDto) {
        Post post = findPostById(postId);
        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setVisibility(postDto.getVisibility());

        Post updatedPost = postRepository.save(post);

        // Optionally notify the post owner that an admin updated their post
        notificationService.createNotification(new CreateNotificationDto(
                "Your post '" + updatedPost.getTitle() + "' was updated by an admin.",
                NotificationType.POST_UPDATED_BY_ADMIN,
                updatedPost.getUser().getId(),
                updatedPost.getId(),
                null
        ));

        return convertToDto(updatedPost);
    }

    public void deletePostByAdmin(Long postId) {
        Post post = findPostById(postId);
        postRepository.delete(post);

        // Optionally notify the post owner that an admin deleted their post
        notificationService.createNotification(new CreateNotificationDto(
                "Your post '" + post.getTitle() + "' was deleted by an admin.",
                NotificationType.POST_DELETED_BY_ADMIN,
                post.getUser().getId(),
                postId,
                null
        ));
    }

    public List<PostResponseDto> filterPostsByCategory(Category category) {
        return postRepository.findByCategoriesContaining(category)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }


    public List<PostResponseDto> getTrendingPosts() {
        return postRepository.findAll()
                .stream()
                .sorted((p1, p2) -> {
                    int score1 = p1.getReactions().size() + p1.getComments().size();
                    int score2 = p2.getReactions().size() + p2.getComments().size();
                    return Integer.compare(score2, score1);
                })
                .limit(5)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public void bulkDeletePosts(List<Long> postIds) {
        List<Post> posts = postRepository.findAllById(postIds);
        postRepository.deleteAll(posts);

        // Optionally notify owners of each deleted post
        posts.forEach(post -> notificationService.createNotification(new CreateNotificationDto(
                "Your post '" + post.getTitle() + "' was deleted in a bulk operation by an admin.",
                NotificationType.POST_DELETED_BY_ADMIN,
                post.getUser().getId(),
                post.getId(),
                null
        )));
    }

    public PostMetricsDto getPostMetrics() {
        List<Post> posts = postRepository.findAll();
        if (posts.isEmpty()) {
            throw new ResourceNotFoundException("No posts found");
        }

        // Find latest post
        Post latest = posts.stream()
                .max(Comparator.comparing(Post::getCreatedAt))
                .orElseThrow(() -> new ResourceNotFoundException("No latest post found"));

        // Find post with most reactions
        Post mostReacted = posts.stream()
                .max(Comparator.comparingInt(p -> p.getReactions().size()))
                .orElseThrow(() -> new ResourceNotFoundException("No reacted post found"));

        // Find post with most comments
        Post mostCommented = posts.stream()
                .max(Comparator.comparingInt(p -> commentRepository.findByPostIdAndParentCommentIsNull(p.getId()).size()))
                .orElseThrow(() -> new ResourceNotFoundException("No commented post found"));

        return new PostMetricsDto(
                convertToDto(latest),
                convertToDto(mostReacted),
                convertToDto(mostCommented)
        );
    }

    // ---------- Private Conversion Methods ----------

    private PostResponseDto convertToDto(Post post) {
        // Reaction data
        List<Object[]> reactionResults = reactionRepository.findReactionTypeCountsByPost(post.getId());
        Map<String, Integer> reactionTypes = reactionResults.stream()
                .collect(Collectors.toMap(
                        row -> ((ReactionType) row[0]).name(),
                        row -> ((Long) row[1]).intValue()
                ));
        int totalReactions = reactionTypes.values().stream().mapToInt(Integer::intValue).sum();

        // Categories
        String categoryName = (post.getCategories() != null)
                ? post.getCategories().name()
                : "Uncategorized";

        // Comments
        List<CommentResponseDto> comments = commentRepository.findByPostIdAndParentCommentIsNull(post.getId())
                .stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());

        // Determine groupId (null if no group is assigned)
        Long groupId = (post.getGroup() != null) ? post.getGroup().getId() : null;

        // Create and return the DTO with the groupId included
        return new PostResponseDto(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getCategories(),
                post.getUser().getUsername(),
                post.getCreatedAt(),
                totalReactions,
                reactionTypes,
                comments,
                groupId   // This field will be null if no group is assigned
        );
    }

    private CommentResponseDto mapToCommentResponse(Comment comment) {
        List<CommentResponseDto> replies = commentRepository.findByParentCommentId(comment.getId())
                .stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());

        // Convert reaction types
        Map<String, Integer> reactionTypes = comment.getReactions().stream()
                .collect(Collectors.groupingBy(r -> r.getType().name(), Collectors.summingInt(r -> 1)));

        return new CommentResponseDto(
                comment.getId(),
                comment.getContent(),
                comment.getUser().getUsername(),
                comment.getMediaUrl(),
                comment.getVisibility(),
                comment.getCreatedAt(),
                comment.getReactions().size(),
                reactionTypes,
                (comment.getParentComment() != null) ? comment.getParentComment().getId() : null,
                comment.isDeleted(),
                replies
        );
    }
}
