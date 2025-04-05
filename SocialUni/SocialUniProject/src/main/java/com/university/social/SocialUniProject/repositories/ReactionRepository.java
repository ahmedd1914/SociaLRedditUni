package com.university.social.SocialUniProject.repositories;

import com.university.social.SocialUniProject.models.Comment;
import com.university.social.SocialUniProject.models.Post;
import com.university.social.SocialUniProject.models.Reaction;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.enums.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {

    Optional<Reaction> findByUserAndPost(User user, Post post);

    Optional<Reaction> findByUserAndComment(User user, Comment comment);

    @Query("SELECT r.type, COUNT(r) FROM Reaction r WHERE r.post.id = :postId GROUP BY r.type")
    List<Object[]> findReactionTypeCountsByPost(@Param("postId") Long postId);

    @Query("SELECT r.type, COUNT(r) FROM Reaction r WHERE r.comment.id = :commentId GROUP BY r.type")
    List<Object[]> findReactionTypeCountsByComment(@Param("commentId") Long commentId);

    List<Reaction> findByType(ReactionType type);

    long countByReactedAtAfter(LocalDateTime date);

    void deleteByPostId(Long postId);

}
