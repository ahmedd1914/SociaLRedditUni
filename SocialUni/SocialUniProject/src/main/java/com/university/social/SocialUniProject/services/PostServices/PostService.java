package com.university.social.SocialUniProject.services.PostServices;

import com.university.social.SocialUniProject.dto.CreatePostDto;
import com.university.social.SocialUniProject.repositories.CommentRepository;
import com.university.social.SocialUniProject.responses.CommentResponseDto;
import com.university.social.SocialUniProject.responses.PostResponseDto;
import com.university.social.SocialUniProject.models.*;
import com.university.social.SocialUniProject.enums.Category;
import com.university.social.SocialUniProject.enums.ReactionType;
import com.university.social.SocialUniProject.enums.Visibility;
import com.university.social.SocialUniProject.repositories.PostRepository;
import com.university.social.SocialUniProject.repositories.ReactionRepository;
import com.university.social.SocialUniProject.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
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

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public Post getPostById(Long postId) {
        Optional<Post> post = postRepository.findById(postId);
        return post.orElseThrow(() -> new RuntimeException("Post not found"));
    }

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

    // For admin: retrieve all posts (irrespective of visibility)
    public List<PostResponseDto> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        return posts.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    // For admin: retrieve a post by its ID (bypassing user check)
    public PostResponseDto getPostResponseDtoById(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return convertToDto(post);
    }

    // For admin: update a post without checking user ownership
    public PostResponseDto updatePostByAdmin(Long postId, CreatePostDto postDto) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setVisibility(postDto.getVisibility());
        // Optionally update groupId or categories if needed
        Post updatedPost = postRepository.save(post);
        return convertToDto(updatedPost);
    }

    // For admin: delete a post without checking user ownership
    public void deletePostByAdmin(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        postRepository.delete(post);
    }
    // For admin: search posts by keyword (title or content)
    public List<PostResponseDto> searchPosts(String keyword) {
        List<Post> posts = postRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(keyword, keyword);
        return posts.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    // For admin: filter posts by category
    public List<PostResponseDto> filterPostsByCategory(Category category) {
        List<Post> posts = postRepository.findByCategoriesContaining(category);
        return posts.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    // Filter posts by date range
    public List<PostResponseDto> getPostsByDateRange(LocalDateTime start, LocalDateTime end) {
        List<Post> posts = postRepository.findAll().stream()
                .filter(post -> !post.getCreatedAt().isBefore(start) && !post.getCreatedAt().isAfter(end))
                .collect(Collectors.toList());
        return posts.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    // Get trending posts (top 5 based on reactions+comments count)
    public List<PostResponseDto> getTrendingPosts() {
        List<Post> posts = postRepository.findAll();
        return posts.stream()
                .sorted((p1, p2) -> {
                    int score1 = p1.getReactions().size() + p1.getComments().size();
                    int score2 = p2.getReactions().size() + p2.getComments().size();
                    return Integer.compare(score2, score1);
                })
                .limit(5)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Bulk delete posts by list of post IDs
    public void bulkDeletePosts(List<Long> postIds) {
        List<Post> posts = postRepository.findAllById(postIds);
        postRepository.deleteAll(posts);
    }

    public Map<String, Object> getPostStatistics() {
        Map<String, Object> stats = new HashMap<>();

        // Total number of posts
        long totalPosts = postRepository.count();
        stats.put("totalPosts", totalPosts);

        // Fetch all posts for aggregation
        List<Post> posts = postRepository.findAll();

        // Total reactions: Sum reactions from each post
        int totalReactions = posts.stream()
                .mapToInt(post -> post.getReactions().size())
                .sum();
        stats.put("totalReactions", totalReactions);

        // Average reactions per post
        double avgReactionsPerPost = totalPosts > 0 ? (double) totalReactions / totalPosts : 0.0;
        stats.put("averageReactionsPerPost", avgReactionsPerPost);

        // Total comments across all posts using CommentRepository's count() method
        long totalComments = commentRepository.count();
        stats.put("totalComments", totalComments);

        // Average comments per post
        double avgCommentsPerPost = totalPosts > 0 ? (double) totalComments / totalPosts : 0.0;
        stats.put("averageCommentsPerPost", avgCommentsPerPost);

        // Breakdown by visibility (assuming Visibility enum with PUBLIC and PRIVATE)
        long publicPosts = posts.stream()
                .filter(post -> post.getVisibility() == Visibility.PUBLIC)
                .count();
        long privatePosts = posts.stream()
                .filter(post -> post.getVisibility() == Visibility.PRIVATE)
                .count();
        stats.put("publicPosts", publicPosts);
        stats.put("privatePosts", privatePosts);

        // Top 5 posts by reaction count (converted to PostResponseDto for display)
        List<PostResponseDto> topPostsByReactions = posts.stream()
                .sorted((p1, p2) -> Integer.compare(p2.getReactions().size(), p1.getReactions().size()))
                .limit(5)
                .map(this::convertToDto)
                .collect(Collectors.toList());
        stats.put("topPostsByReactions", topPostsByReactions);

        // Breakdown of posts per category (each post may have multiple categories)
        Map<String, Long> postsByCategory = posts.stream()
                .flatMap(post -> post.getCategories().stream())
                .collect(Collectors.groupingBy(Enum::name, Collectors.counting()));
        stats.put("postsByCategory", postsByCategory);

        // Top active authors: count of posts per author (by username)
        Map<String, Long> postsByAuthor = posts.stream()
                .collect(Collectors.groupingBy(post -> post.getUser().getUsername(), Collectors.counting()));
        stats.put("postsByAuthor", postsByAuthor);

        return stats;
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
