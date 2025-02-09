package com.university.social.SocialUniProject.controllers;

import com.university.social.SocialUniProject.dto.PostDto.CreatePostDto;
import com.university.social.SocialUniProject.dto.PostDto.PostResponseDto;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.services.PostServices.PostService;
import com.university.social.SocialUniProject.services.UserServices.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RequestMapping("/posts")
@RestController
public class PostController {

    @Autowired
    private PostService postService;
    @Autowired
    private UserService userService;

    // ✅ Get all public posts (visible to everyone)
    @GetMapping("/public")
    public ResponseEntity<List<PostResponseDto>> getPublicPosts() {
        List<PostResponseDto> posts = postService.getAllPublicPosts();
        return ResponseEntity.ok(posts);
    }

    @PostMapping("/create")
    public ResponseEntity<PostResponseDto> createPost(@RequestBody CreatePostDto postDto) {
        System.out.println("🔹 Incoming request to /posts/create");

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            System.out.println("❌ User is NULL (Authentication failed). Check JWT.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        // ✅ Extract userId from SecurityContext
        String userId = authentication.getName(); // Extract userId as a String
        System.out.println("✅ User ID from SecurityContext: " + userId);

        // ✅ Fetch the actual User entity from the database
        User user = userService.getUserById(Long.parseLong(userId));

        if (user == null) {
            System.out.println("❌ User not found in database. Authentication issue.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        System.out.println("✅ User Found: ID=" + user.getId() + ", Email=" + user.getEmail());

        try {
            PostResponseDto response = postService.createPost(postDto, user.getId());
            System.out.println("✅ Post Created with ID: " + response.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Error creating post: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // ✅ Edit a post (only by the post owner)
    @PutMapping("/{postId}")
    public ResponseEntity<PostResponseDto> updatePost(
            @AuthenticationPrincipal User user, @PathVariable Long postId,
            @RequestBody CreatePostDto postDto) {
        if (user == null) {
            return ResponseEntity.status(401).build(); // Unauthorized
        }
        PostResponseDto response = postService.updatePost(postId, postDto, user.getId());
        return ResponseEntity.ok(response);
    }

    // ✅ Delete a post (only by the post owner)
    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@AuthenticationPrincipal User user,
                                        @PathVariable Long postId) {
        if (user == null) {
            return ResponseEntity.status(401).build(); // Unauthorized
        }
        postService.deletePost(postId, user.getId());
        return ResponseEntity.ok().build();
    }
}
