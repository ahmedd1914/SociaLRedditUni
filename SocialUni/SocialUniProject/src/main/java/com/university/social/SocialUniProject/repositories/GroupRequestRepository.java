package com.university.social.SocialUniProject.repositories;

import com.university.social.SocialUniProject.models.GroupRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupRequestRepository extends JpaRepository<GroupRequest, Long> {
    long countByStatus(String status);
} 