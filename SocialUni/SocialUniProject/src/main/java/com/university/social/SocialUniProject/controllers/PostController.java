package com.university.social.SocialUniProject.controllers;

import com.university.social.SocialUniProject.dto.CreatePostDto;
import com.university.social.SocialUniProject.enums.Category;
import com.university.social.SocialUniProject.responses.PostResponseDto;
import com.university.social.SocialUniProject.services.PostServices.PostService;
import com.university.social.SocialUniProject.services.UserServices.UserService;
import com.university.social.SocialUniProject.utils.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.time.LocalDateTime;
import java.util.stream.Collectors;
import com.university.social.SocialUniProject.exceptions.ResourceNotFoundException;

@RestController
@RequestMapping("/posts")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8080"
}, allowCredentials = "true")
public class PostController {

    private final PostService postService;
    private final UserService userService;

    public PostController(PostService postService, UserService userService) {
        this.postService = postService;
        this.userService = userService;
    }

    @GetMapping("/public")
    public ResponseEntity<List<PostResponseDto>> getPublicPosts() {
        List<PostResponseDto> posts = postService.getAllPublicPosts();
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/public/{postId}")
    public ResponseEntity<PostResponseDto> getPublicPostById(@PathVariable Long postId) {
        System.out.println("[DEBUG] Accessing public post with ID: " + postId);
        PostResponseDto post = postService.getPublicPostById(postId);
        if (post == null) {
            System.out.println("[DEBUG] Post not found or not public, returning no content");
            return ResponseEntity.noContent().build();
        }
        System.out.println("[DEBUG] Successfully retrieved public post: " + post.getId());
        return ResponseEntity.ok(post);
    }

    @GetMapping("/trending")
    public ResponseEntity<List<PostResponseDto>> getTrendingPosts(
            @RequestParam(required = false) String timeFilter,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String searchTerm) {
        
        List<PostResponseDto> trendingPosts = postService.getTrendingPosts();
        
        // Apply time filter if provided
        if (timeFilter != null && !timeFilter.isEmpty()) {
            final LocalDateTime cutoffTime;
            switch (timeFilter.toLowerCase()) {
                case "day":
                    cutoffTime = LocalDateTime.now().minusDays(1);
                    break;
                case "week":
                    cutoffTime = LocalDateTime.now().minusWeeks(1);
                    break;
                case "month":
                    cutoffTime = LocalDateTime.now().minusMonths(1);
                    break;
                case "year":
                    cutoffTime = LocalDateTime.now().minusYears(1);
                    break;
                default:
                    // Default to all time
                    cutoffTime = LocalDateTime.now().minusYears(100); // Effectively all time
                    break;
            }
            
            trendingPosts = trendingPosts.stream()
                    .filter(post -> post.getCreatedAt().isAfter(cutoffTime))
                    .collect(Collectors.toList());
        }
        
        // Apply category filter if provided
        if (category != null && !category.isEmpty()) {
            try {
                Category categoryEnum = Category.valueOf(category.toUpperCase());
                trendingPosts = trendingPosts.stream()
                        .filter(post -> post.getCategory() == categoryEnum)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Invalid category, return all posts
            }
        }
        
        // Apply search term filter if provided
        if (searchTerm != null && !searchTerm.isEmpty()) {
            String lowerSearchTerm = searchTerm.toLowerCase();
            trendingPosts = trendingPosts.stream()
                    .filter(post -> 
                        post.getTitle().toLowerCase().contains(lowerSearchTerm) || 
                        post.getContent().toLowerCase().contains(lowerSearchTerm))
                    .collect(Collectors.toList());
        }
        
        return ResponseEntity.ok(trendingPosts);
    }

    @PostMapping("/create")
    public ResponseEntity<PostResponseDto> createPost(@Valid @RequestBody CreatePostDto postDto) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        PostResponseDto response = postService.createPost(postDto, userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{postId}")
    public ResponseEntity<PostResponseDto> updatePost(@PathVariable Long postId,
                                                      @RequestBody CreatePostDto postDto) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        PostResponseDto response = postService.updatePost(postId, postDto, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        postService.deletePost(postId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostResponseDto> getPostById(@PathVariable Long postId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        try {
            PostResponseDto post = postService.getPostByIdDto(postId);
            return ResponseEntity.ok(post);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
