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
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final EntityManager entityManager;

    @Autowired
    public PostService(PostRepository postRepository,
                       UserRepository userRepository,
                       ReactionRepository reactionRepository,
                       CommentRepository commentRepository,
                       NotificationService notificationService,
                       GroupRepository groupRepository,
                       EntityManager entityManager) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.reactionRepository = reactionRepository;
        this.commentRepository = commentRepository;
        this.notificationService = notificationService;
        this.groupRepository = groupRepository;
        this.entityManager = entityManager;
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

    @Transactional
    public PostResponseDto createPost(CreatePostDto postDto, Long userId) {
        User user = findUserById(userId);

        // Validate category
        if (postDto.getCategory() == null) {
            throw new ResourceNotFoundException("Invalid category: null");
        }

        // Validate group ID is provided
        if (postDto.getGroupId() == null) {
            throw new ResourceNotFoundException("Group ID is required. Posts can only be created within groups.");
        }

        // Fetch the group with members eagerly loaded
        Group group = groupRepository.findById(postDto.getGroupId())
                .map(g -> {
                    // Initialize the collections
                    g.getMembers().size();
                    g.getAdmins().size();
                    return g;
                })
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Group not found with ID: " + postDto.getGroupId()));
        
        // Verify user is a member of the group
        if (!group.getMembers().contains(user) && !group.getAdmins().contains(user) && !group.getOwner().getId().equals(userId)) {
            throw new UnauthorizedActionException("You must be a member of the group to create posts.");
        }

        Post post = new Post();
        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setUser(user);
        post.setVisibility(postDto.getVisibility());
        post.setCreatedAt(LocalDateTime.now());
        post.setCategories(postDto.getCategory());
        post.setGroup(group);

        Post savedPost = postRepository.save(post);
        if (savedPost.getId() == null) {
            throw new ResourceNotFoundException("Failed to save post");
        }

        // Notify user that their post was created
        notificationService.createNotification(new CreateNotificationDto(
                null,
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

    public PostResponseDto getPublicPostById(Long postId) {
        System.out.println("[DEBUG] PostService: Fetching public post with ID: " + postId);
        try {
            Post post = findPostById(postId);
            System.out.println("[DEBUG] PostService: Found post with visibility: " + post.getVisibility());
            if (post.getVisibility() != Visibility.PUBLIC) {
                System.out.println("[DEBUG] PostService: Post is not public, returning null");
                return null;
            }
            System.out.println("[DEBUG] PostService: Converting post to DTO");
            return convertToDto(post);
        } catch (ResourceNotFoundException e) {
            System.out.println("[DEBUG] PostService: Post not found, returning null");
            return null;
        }
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
                null,
                NotificationType.POST_CREATED,
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
                null, // Use default message
                NotificationType.POST_CREATED,
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

        // Notify the post owner that an admin updated their post
        notificationService.createNotification(new CreateNotificationDto(
                null,
                NotificationType.POST_CREATED,
                updatedPost.getUser().getId(),
                updatedPost.getId(),
                null
        ));

        return convertToDto(updatedPost);
    }

    @Transactional
    public void deletePostByAdmin(Long postId) {
        System.out.println("[DEBUG] Starting admin deletion process for post ID: " + postId);
        
        Post post = findPostById(postId);
        System.out.println("[DEBUG] Found post to delete: " + post.getId());
        
        // Get the user ID for notification before deleting the post
        Long userId = post.getUser().getId();
        
        try {
            // First, delete all reactions associated with comments on this post
            entityManager.createNativeQuery("DELETE r FROM reactions r INNER JOIN comments c ON r.comment_id = c.id WHERE c.post_id = ?")
                    .setParameter(1, postId)
                    .executeUpdate();
            
            // Then delete all reactions associated with the post directly
            entityManager.createNativeQuery("DELETE FROM reactions WHERE post_id = ?")
                    .setParameter(1, postId)
                    .executeUpdate();
            
            // First, find all comments that reference comments from this post as parents
            entityManager.createNativeQuery(
                "UPDATE comments c1 " +
                "INNER JOIN comments c2 ON c1.parent_comment_id = c2.id " +
                "SET c1.parent_comment_id = NULL " +
                "WHERE c2.post_id = ?")
                .setParameter(1, postId)
                .executeUpdate();
            
            // Now we can safely delete all comments for this post
            entityManager.createNativeQuery("DELETE FROM comments WHERE post_id = ?")
                    .setParameter(1, postId)
                    .executeUpdate();
            
            // Finally delete the post
            postRepository.delete(post);
            
            System.out.println("[DEBUG] Post and all associated data deleted successfully");
            
            // Notify the post owner that an admin deleted their post
            notificationService.createNotification(new CreateNotificationDto(
                    null,
                    NotificationType.POST_DELETED_BY_ADMIN,
                    userId,
                    postId,
                    null
            ));
            System.out.println("[DEBUG] Notification sent to post owner");
            
        } catch (Exception e) {
            System.out.println("[DEBUG] Error during deletion of post " + postId + ": " + e.getMessage());
            throw e;
        }
    }

    public List<PostResponseDto> filterPostsByCategory(Category category) {
        return postRepository.findByCategoriesContaining(category)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }


    /**
     * Get trending posts based on multiple factors similar to Reddit's algorithm:
     * 1. Post Velocity - How quickly a post is gaining engagement
     * 2. Engagement Surge - Sudden spikes in reactions and comments
     * 3. Search Trends - Posts that match popular search terms
     * 4. Time Decay - Older posts gradually lose trending status
     */
    public List<PostResponseDto> getTrendingPosts() {
        LocalDateTime now = LocalDateTime.now();
        
        // Get all public posts
        List<Post> allPosts = postRepository.findByVisibility(Visibility.PUBLIC);
        
        // Calculate trending scores for each post using the Post model methods
        List<Post> postsWithScores = allPosts.stream()
                .map(post -> {
                    double totalScore = post.calculateTrendingScore(now);
                    
                    // Create a wrapper class for post and score
                    class PostScore {
                        final Post post;
                        final double score;
                        
                        PostScore(Post post, double score) {
                            this.post = post;
                            this.score = score;
                        }
                    }
                    
                    return new PostScore(post, totalScore);
                })
                .sorted((a, b) -> Double.compare(b.score, a.score))
                .limit(5)
                .map(obj -> obj.post)
                .collect(Collectors.toList());
        
        // Convert to DTOs
        return postsWithScores.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public void bulkDeletePosts(List<Long> postIds) {
        List<Post> posts = postRepository.findAllById(postIds);
        postRepository.deleteAll(posts);

        // Optionally notify owners of each deleted post
        posts.forEach(post -> notificationService.createNotification(new CreateNotificationDto(
                null, // Use default message
                NotificationType.POST_CREATED,
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

        // Create and return the DTO with all fields
        return new PostResponseDto(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getCategories(),
                post.getVisibility(),
                post.getUser().getUsername(),
                post.getCreatedAt(),
                totalReactions,
                reactionTypes,
                comments,
                groupId
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
                comment.getUser().getUsername(),
                comment.getContent(),
                comment.getMediaUrl(),
                comment.getVisibility(),
                comment.getCreatedAt(),
                comment.getReactions().size(),
                reactionTypes,
                (comment.getParentComment() != null) ? comment.getParentComment().getId() : null,
                comment.isDeleted(),
                replies,
                comment.getPost().getId()
        );
    }
}
