package com.university.social.SocialUniProject.services.PostServices;

import com.university.social.SocialUniProject.dto.PostDto.CreatePostDto;
import com.university.social.SocialUniProject.dto.PostDto.PostResponseDto;
import com.university.social.SocialUniProject.models.*;
import com.university.social.SocialUniProject.models.Enums.Category;
import com.university.social.SocialUniProject.models.Enums.Visibility;
import com.university.social.SocialUniProject.repositories.PostRepository;
import com.university.social.SocialUniProject.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    public PostResponseDto createPost(CreatePostDto postDto, Long userId) {
        System.out.println("Received Post Request: " + postDto.getTitle());
        System.out.println("User ID: " + userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (postDto.getCategoryId() == null || postDto.getCategoryId() < 0 || postDto.getCategoryId() >= Category.values().length) {
            throw new RuntimeException("Invalid category ID: " + postDto.getCategoryId());
        }

        System.out.println("Category ID is valid.");

        Post post = new Post();
        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setUser(user);
        post.setVisibility(postDto.getVisibility());

        Category category = Category.values()[postDto.getCategoryId().intValue()];
        post.setCategories(Set.of(category));

        System.out.println("Saving post...");
        Post savedPost = postRepository.save(post);

        if (savedPost == null) {
            throw new RuntimeException("Failed to save post");
        }

        System.out.println("Post saved successfully: " + savedPost.getId());

        return convertToDto(savedPost);
    }


    public List<PostResponseDto> getAllPublicPosts() {
        List<Post> posts = postRepository.findByVisibility(Visibility.PUBLIC);
        return posts.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public PostResponseDto updatePost(Long postId, CreatePostDto postDto, Long userId) {
        Post post = postRepository.findByIdAndUserId(postId, userId)
                .orElseThrow(() -> new RuntimeException("Unauthorized or Post not found"));

        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setVisibility(postDto.getVisibility());
        postRepository.save(post);

        return convertToDto(post);
    }

    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findByIdAndUserId(postId, userId)
                .orElseThrow(() -> new RuntimeException("Unauthorized or Post not found"));

        postRepository.delete(post);
    }

    private PostResponseDto convertToDto(Post post) {
        return new PostResponseDto(post.getId(), post.getTitle(), post.getContent(),
                post.getCategories().toString(), post.getUser().getUsername(),
                post.getCreatedAt());
    }
}
