package com.university.social.SocialUniProject.repositories;

import com.university.social.SocialUniProject.models.Comment;
import com.university.social.SocialUniProject.models.Post;
import com.university.social.SocialUniProject.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostIdAndParentCommentIsNull(Long postId);

    List<Comment> findByParentCommentId(Long parentCommentId);
    List<Comment> findByPostOrderByCreatedAtDesc(Post post);

    List<Comment> findByParentCommentOrderByCreatedAtDesc(Comment parentComment);

    Optional<Comment> findById(Long id);
    List<Comment> findByUserId(Long userId);
    void deleteByPost(Post post);
    List<Comment> findByIsDeletedFalse();
    
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.isDeleted = false AND c.user.deleted = false")
    long countActiveRecords();
}