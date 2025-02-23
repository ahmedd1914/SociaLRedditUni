package com.university.social.SocialUniProject.services;

import com.university.social.SocialUniProject.responses.UserResponseDto;
import com.university.social.SocialUniProject.models.Enums.Role;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.repositories.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;

    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 1️⃣ View All Users
    public List<UserResponseDto> getAllUsers() {
        List<User> users = (List<User>) userRepository.findAll(); // Cast Iterable to List
        return users.stream().map(this::mapToDto).collect(Collectors.toList());
    }


    // 2️⃣ Search & Filter Users
    public List<UserResponseDto> searchUsers(String username, Role role) {
        List<User> users;
        if (username != null && role != null) {
            users = userRepository.findByUsernameContainingAndRole(username, role);
        } else if (username != null) {
            users = userRepository.findByUsernameContaining(username);
        } else if (role != null) {
            users = userRepository.findByRole(role);
        } else {
            users = (List<User>) userRepository.findAll();
        }
        return users.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    // 3️⃣ Ban User
    public void banUser(Long userId) {
        // Get the currently logged-in admin
        UserDetails currentAdmin = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User adminUser = userRepository.findByUsername(currentAdmin.getUsername())
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        // Prevent self-ban
        if (adminUser.getId().equals(userId)) {
            throw new RuntimeException("Admins cannot ban themselves.");
        }

        // Retrieve the user to be banned
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();

        // Prevent banning other admins
        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Admins cannot ban other admins.");
        }

        // Disable user account
        user.setEnabled(false);
        userRepository.save(user);
    }


    // 4️⃣ Unban User
    public void unbanUser(Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setEnabled(true); // Enable user
            userRepository.save(user);
        } else {
            throw new RuntimeException("User not found");
        }
    }

    // 5️⃣ Change User Role
    public void changeUserRole(Long userId, Role newRole) {
        // Get currently logged-in admin
        UserDetails currentAdmin = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User adminUser = userRepository.findByUsername(currentAdmin.getUsername())
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        // Prevent last admin from being removed
        long adminCount = userRepository.countByRole(Role.ADMIN);
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            if (user.getRole() == Role.ADMIN && adminCount == 1) {
                throw new RuntimeException("Cannot change the role of the last admin.");
            }

            user.setRole(newRole);
            userRepository.save(user);
        } else {
            throw new RuntimeException("User not found");
        }
    }

    public void deleteUser(Long userId) {
        UserDetails currentAdmin = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User adminUser = userRepository.findByUsername(currentAdmin.getUsername())
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (adminUser.getId().equals(userId)) {
            throw new RuntimeException("Admins cannot delete themselves.");
        }

        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();

        // Prevent deleting the last admin
        long adminCount = userRepository.countByRole(Role.ADMIN);
        if (user.getRole() == Role.ADMIN && adminCount == 1) {
            throw new RuntimeException("Cannot delete the last admin.");
        }

        userRepository.deleteById(userId);
    }



    private UserResponseDto mapToDto(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled(),
                user.getLastLogin()
        );
    }
}
