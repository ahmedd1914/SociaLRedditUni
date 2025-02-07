package com.university.social.SocialUniProject.repositories;

import com.university.social.SocialUniProject.models.Post;
import com.university.social.SocialUniProject.models.Enums.Visibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    // Find all public posts
    List<Post> findByVisibility(Visibility visibility);

    // Find a post by ID and ensure the user is the owner (for editing/deletion)
    Optional<Post> findByIdAndUserId(Long id, Long userId);
}