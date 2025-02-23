package com.university.social.SocialUniProject.repositories;

import com.university.social.SocialUniProject.enums.Role;
import com.university.social.SocialUniProject.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findById(Long id);
    Optional<User> findByVerificationCode(String verificationCode);
    List<User> findByUsernameContaining(String username);
    List<User> findByRole(Role role);
    List<User> findByUsernameContainingAndRole(String username, Role role);
    Optional<User> findByUsername(String username);
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'ADMIN'")
    long countByRole(Role role);

}