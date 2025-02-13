package com.university.social.SocialUniProject.repositories;

import com.university.social.SocialUniProject.models.Post;
import com.university.social.SocialUniProject.models.Enums.Visibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByVisibility(Visibility visibility);

    Optional<Post> findByIdAndUserId(Long id, Long userId);
}