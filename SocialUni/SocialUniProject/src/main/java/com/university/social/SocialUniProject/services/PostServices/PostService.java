package com.university.social.SocialUniProject.services.PostServices;

import com.university.social.SocialUniProject.dto.PostDto.CreatePostDto;
import com.university.social.SocialUniProject.dto.PostDto.PostResponseDto;
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
import java.util.HashMap;
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

    public PostResponseDto createPost(CreatePostDto postDto, Long userId) {
        System.out.println("✅ Received Post Request: " + postDto.getTitle());
        System.out.println("🔹 User ID: " + userId);

        // 1️⃣ Retrieve User
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("❌ User not found"));

        // 2️⃣ Validate Category ID
        if (postDto.getCategoryId() == null || postDto.getCategoryId() < 0 || postDto.getCategoryId() >= Category.values().length) {
            throw new RuntimeException("❌ Invalid category ID: " + postDto.getCategoryId());
        }
        System.out.println("✅ Category ID is valid: " + postDto.getCategoryId());

        // 3️⃣ Create Post Object
        Post post = new Post();
        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setUser(user);
        post.setVisibility(postDto.getVisibility());
        post.setCreatedAt(LocalDateTime.now()); // Ensure createdAt is set

        // 4️⃣ Assign Category
        Category category = Category.values()[postDto.getCategoryId().intValue()];
        post.setCategories(Set.of(category));

        // 5️⃣ Save Post to Database
        System.out.println("💾 Saving post...");
        Post savedPost = postRepository.save(post);

        if (savedPost.getId() == null) {
            throw new RuntimeException("❌ Failed to save post");
        }

        System.out.println("✅ Post saved successfully: " + savedPost.getId());

        // 6️⃣ Convert and Return Response DTO
        return convertToDto(savedPost);
    }


    public List<PostResponseDto> getAllPublicPosts() {
        List<Post> posts = postRepository.findByVisibility(Visibility.PUBLIC);
        return posts.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public PostResponseDto updatePost(Long postId, CreatePostDto postDto, Long userId) {
        // 1️⃣ Retrieve the existing post
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // 2️⃣ Ensure the authenticated user is the owner
        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only edit your own posts.");
        }

        // 3️⃣ Update the post fields
        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setVisibility(postDto.getVisibility());

        // 4️⃣ Save the updated post
        Post updatedPost = postRepository.save(post);
        System.out.println("Post updated successfully: " + updatedPost.getId());

        // 5️⃣ Return the updated post as DTO
        return convertToDto(updatedPost);
    }

    public void deletePost(Long postId, Long userId) {
        // 1️⃣ Retrieve the existing post
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("❌ Post not found"));

        // 2️⃣ Ensure the authenticated user is the owner
        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("❌ Unauthorized: You can only delete your own posts.");
        }

        // 3️⃣ Delete the post
        postRepository.delete(post);
        System.out.println("✅ Post deleted successfully: " + postId);
    }

    private PostResponseDto convertToDto(Post post) {
        // Fetch reaction data
        List<Object[]> reactionResults = reactionRepository.findReactionTypeCountsByPost(post.getId());
        
        // Convert List<Object[]> to Map<String, Integer>
        Map<String, Integer> reactionTypes = reactionResults.stream()
                .collect(Collectors.toMap(
                        row -> ((ReactionType) row[0]).name(), // Convert Enum to String
                        row -> ((Long) row[1]).intValue()
                ));


        int totalReactions = reactionTypes.values().stream().mapToInt(Integer::intValue).sum();

        return new PostResponseDto(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getCategories().toString(),
                post.getUser().getUsername(),
                post.getCreatedAt(),
                totalReactions,
                reactionTypes
        );
    }




}
