package com.university.social.SocialUniProject.controllers;

import com.university.social.SocialUniProject.dto.CreatePostDto;
import com.university.social.SocialUniProject.responses.PostResponseDto;
import com.university.social.SocialUniProject.services.PostServices.PostService;
import com.university.social.SocialUniProject.services.UserServices.UserService;
import com.university.social.SocialUniProject.utils.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/posts")
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

    @PostMapping("/create")
    public ResponseEntity<PostResponseDto> createPost(@RequestBody CreatePostDto postDto) {
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
}
