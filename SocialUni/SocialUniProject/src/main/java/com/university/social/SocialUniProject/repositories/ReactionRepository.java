package com.university.social.SocialUniProject.repositories;

import com.university.social.SocialUniProject.models.Reaction;
import com.university.social.SocialUniProject.models.Post;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.models.Enums.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {

    int countByPost(Post post);

    @Query("SELECT r.type, COUNT(r) FROM Reaction r WHERE r.post.id = :postId GROUP BY r.type")
    List<Object[]> findReactionTypeCountsByPost(@Param("postId") Long postId);



    Optional<Reaction> findByUserAndPost(User user, Post post);
}
