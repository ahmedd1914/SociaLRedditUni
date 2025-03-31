package com.university.social.SocialUniProject.repositories;

import com.university.social.SocialUniProject.enums.Category;
import com.university.social.SocialUniProject.enums.Visibility;
import com.university.social.SocialUniProject.models.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByCategory(Category category);
    List<Group> findByVisibility(Visibility visibility);
    List<Group> findByOwnerId(Long ownerId);
    
    @Query("SELECT COUNT(g) FROM Group g WHERE g.owner.deleted = false")
    long countActiveRecords();
}