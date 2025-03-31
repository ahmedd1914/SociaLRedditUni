package com.university.social.SocialUniProject.repositories;

import com.university.social.SocialUniProject.enums.Category;
import com.university.social.SocialUniProject.models.Post;
import com.university.social.SocialUniProject.enums.Visibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByVisibility(Visibility visibility);

    // For searching posts by keyword in title or content
    List<Post> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(String titleKeyword, String contentKeyword);

    // For filtering posts by category (assuming categories is a collection)
    List<Post> findByCategoriesContaining(Category category);
    List<Post> findByUserId(Long userId);
    
    @Query("SELECT COUNT(p) FROM Post p WHERE p.user.deleted = false")
    long countActiveRecords();
}