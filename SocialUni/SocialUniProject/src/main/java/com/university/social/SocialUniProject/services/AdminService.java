package com.university.social.SocialUniProject.services;

import com.university.social.SocialUniProject.dto.CreateUserDto;
import com.university.social.SocialUniProject.exceptions.ResourceNotFoundException;
import com.university.social.SocialUniProject.responses.UserResponseDto;
import com.university.social.SocialUniProject.enums.Role;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.repositories.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import com.university.social.SocialUniProject.dto.AdminStatsDto;
import com.university.social.SocialUniProject.dto.NotificationStatsDto;
import com.university.social.SocialUniProject.dto.ReactionStatsDto;
import com.university.social.SocialUniProject.dto.UserDto.UsersDto;
import com.university.social.SocialUniProject.enums.NotificationType;
import com.university.social.SocialUniProject.enums.ReactionType;

@Service
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final GroupRepository groupRepository;
    private final EventRepository eventRepository;
    private final MessageRepository messageRepository;
    private final NotificationRepository notificationRepository;
    private final ReactionRepository reactionRepository;
    private final GroupRequestRepository groupRequestRepository;

    public AdminService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            PostRepository postRepository,
            CommentRepository commentRepository,
            GroupRepository groupRepository,
            EventRepository eventRepository,
            MessageRepository messageRepository,
            NotificationRepository notificationRepository,
            ReactionRepository reactionRepository,
            GroupRequestRepository groupRequestRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.groupRepository = groupRepository;
        this.eventRepository = eventRepository;
        this.messageRepository = messageRepository;
        this.notificationRepository = notificationRepository;
        this.reactionRepository = reactionRepository;
        this.groupRequestRepository = groupRequestRepository;
    }

    // 1️⃣ View All Users
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAllActive()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // 7️⃣ Get Single User
    public UserResponseDto getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return mapToDto(user);
    }

    public UserResponseDto createUser(CreateUserDto dto) {
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));

        // Set optional fields if provided
        user.setFName(dto.getFName());
        user.setLName(dto.getLName());
        user.setPhoneNumber(dto.getPhoneNumber());

        // Set default values
        user.setRole(com.university.social.SocialUniProject.enums.Role.USER);
        user.setEnabled(true);
        user.setCreatedAt(LocalDateTime.now());
        // Optionally, you might leave lastLogin as null until the first login

        // Save the user
        user = userRepository.save(user);

        // Map the user to a response DTO
        return UserResponseDto.fromEntity(user);
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

    // 6️⃣ Delete User
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

        // Soft delete the user
        user.setDeleted(true);
        user.setEnabled(false);
        userRepository.save(user);
    }

    public AdminStatsDto getAdminStats() {
        AdminStatsDto stats = new AdminStatsDto();
        
        // Count only active users (not deleted)
        stats.setTotalUsers(userRepository.findAllActive().size());
        
        // Count all active posts
        stats.setTotalPosts(postRepository.countActiveRecords());
        
        // Count all active comments
        stats.setTotalComments(commentRepository.countActiveRecords());
        
        // Count all active groups
        stats.setTotalGroups(groupRepository.countActiveRecords());
        
        // Count all active events
        stats.setTotalEvents(eventRepository.count());
        
        // Count all active messages
        stats.setTotalMessages(messageRepository.countActiveRecords());
        
        // Count pending group requests
        stats.setTotalGroupRequests(groupRequestRepository.countByStatus("PENDING"));
        
        // Get recent users (last 10)
        List<User> recentUsers = userRepository.findTop10ByOrderByCreatedAtDesc();
        List<UsersDto> userDtos = recentUsers.stream()
                .map(user -> UsersDto.fromEntity(user))
                .collect(Collectors.toList());
        stats.setRecentUsers(userDtos);
        
        return stats;
    }

    public NotificationStatsDto getNotificationStats() {
        NotificationStatsDto stats = new NotificationStatsDto();
        stats.setTotalNotifications(notificationRepository.count());
        stats.setUnreadCount(notificationRepository.countByIsReadFalse());
        
        // Count notifications from last 24 hours
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        stats.setRecentNotificationsCount(notificationRepository.countByCreatedAtAfter(yesterday));
        
        // Count by notification type
        Map<String, Long> notificationsByType = notificationRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        notification -> notification.getNotificationType().name(),
                        Collectors.counting()
                ));
        stats.setNotificationsByType(notificationsByType);
        
        return stats;
    }

    public ReactionStatsDto getReactionStats() {
        ReactionStatsDto stats = new ReactionStatsDto();
        stats.setTotalReactions(reactionRepository.count());
        
        // Count reactions from last 24 hours
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        stats.setRecentReactionsCount(reactionRepository.countByReactedAtAfter(yesterday));
        
        // Count by reaction type
        Map<String, Long> reactionsByType = reactionRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        reaction -> reaction.getType().name(),
                        Collectors.counting()
                ));
        stats.setReactionsByType(reactionsByType);
        
        // Find most common reaction
        String mostCommon = reactionsByType.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("NONE");
        stats.setMostCommonReaction(mostCommon);
        
        return stats;
    }

    // ---------- Private Conversion Method ----------
    private UserResponseDto mapToDto(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled(),
                user.getLastLogin(),
                user.getFName(),
                user.getLName(),
                user.getPhoneNumber(),
                user.getImgUrl(),
                user.getCreatedAt()
        );
    }
}
