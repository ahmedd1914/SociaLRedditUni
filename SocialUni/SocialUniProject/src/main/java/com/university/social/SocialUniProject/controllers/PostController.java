package com.university.social.SocialUniProject.controllers;

import com.university.social.SocialUniProject.dto.PostDto.CreatePostDto;
import com.university.social.SocialUniProject.dto.PostDto.PostResponseDto;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.services.PostServices.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RequestMapping("/posts")
@RestController
public class PostController {

    @Autowired
    private PostService postService;

    // ✅ Get all public posts (visible to everyone)
    @GetMapping("/public")
    public ResponseEntity<List<PostResponseDto>> getPublicPosts() {
        List<PostResponseDto> posts = postService.getAllPublicPosts();
        return ResponseEntity.ok(posts);
    }

    // ✅ Create a new post (only for logged-in users)
    @PostMapping
    public ResponseEntity<PostResponseDto> createPost(
            @AuthenticationPrincipal User user, @RequestBody CreatePostDto postDto) {
        if (user == null) {
            return ResponseEntity.status(401).build(); // Unauthorized
        }
        PostResponseDto response = postService.createPost(postDto, user.getId());
        return ResponseEntity.ok(response);
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
