package com.university.social.SocialUniProject.repositories;

import com.university.social.SocialUniProject.models.Enums.Category;
import com.university.social.SocialUniProject.models.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByCategory(Category category);
}