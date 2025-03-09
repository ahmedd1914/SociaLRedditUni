package com.university.social.SocialUniProject.controllers.AdminControllers;

import com.university.social.SocialUniProject.dto.CreatePostDto;
import com.university.social.SocialUniProject.enums.Category;
import com.university.social.SocialUniProject.responses.PostMetricsDto;
import com.university.social.SocialUniProject.responses.PostResponseDto;
import com.university.social.SocialUniProject.services.PostServices.PostService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/posts")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminPostController {

    private final PostService postService;

    public AdminPostController(PostService postService) {
        this.postService = postService;
    }

    // 1. List all posts (admin view)
    @GetMapping
    public ResponseEntity<List<PostResponseDto>> getAllPosts() {
        List<PostResponseDto> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    // 2. Get a specific post by ID
    @GetMapping("/{postId}")
    public ResponseEntity<PostResponseDto> getPostById(@PathVariable Long postId) {
        PostResponseDto post = postService.getPostResponseDtoById(postId);
        return ResponseEntity.ok(post);
    }

    // 3. Update a post as admin
    @PutMapping("/{postId}")
    public ResponseEntity<PostResponseDto> updatePost(@PathVariable Long postId,
                                                      @RequestBody CreatePostDto postDto) {
        PostResponseDto updatedPost = postService.updatePostByAdmin(postId, postDto);
        return ResponseEntity.ok(updatedPost);
    }

    // 4. Delete a post as admin
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
        postService.deletePostByAdmin(postId);
        return ResponseEntity.noContent().build();
    }

    // 6. Filter posts by category
    @GetMapping("/filter")
    public ResponseEntity<List<PostResponseDto>> filterPostsByCategory(@RequestParam String category) {
        Category cat;
        try {
            cat = Category.valueOf(category.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        List<PostResponseDto> posts = postService.filterPostsByCategory(cat);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/metrics")
    public ResponseEntity<PostMetricsDto> getPostMetrics() {
        PostMetricsDto metrics = postService.getPostMetrics();
        return ResponseEntity.ok(metrics);
    }

    // Trending posts: top 5 posts based on combined reactions and comments
    @GetMapping("/trending")
    public ResponseEntity<List<PostResponseDto>> getTrendingPosts() {
        List<PostResponseDto> trendingPosts = postService.getTrendingPosts();
        return ResponseEntity.ok(trendingPosts);
    }

    // Bulk delete posts: receive list of post IDs in the request body
    @DeleteMapping("/bulk")
    public ResponseEntity<Void> bulkDeletePosts(@RequestBody List<Long> postIds) {
        postService.bulkDeletePosts(postIds);
        return ResponseEntity.noContent().build();
    }

}
