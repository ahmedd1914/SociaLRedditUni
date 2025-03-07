package com.university.social.SocialUniProject.services;

import com.university.social.SocialUniProject.dto.UserActivityDto;
import com.university.social.SocialUniProject.enums.ActivityType;
import com.university.social.SocialUniProject.models.Comment;
import com.university.social.SocialUniProject.models.Group;
import com.university.social.SocialUniProject.models.Post;
import com.university.social.SocialUniProject.repositories.CommentRepository;
import com.university.social.SocialUniProject.repositories.GroupRepository;
import com.university.social.SocialUniProject.repositories.PostRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class UserActivityService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final GroupRepository groupRepository;

    public UserActivityService(PostRepository postRepository,
                               CommentRepository commentRepository,
                               GroupRepository groupRepository) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.groupRepository = groupRepository;
    }

    public List<UserActivityDto> getUserActivities(Long userId) {
        List<UserActivityDto> activities = new ArrayList<>();

        // Fetch posts created by the user
        List<Post> posts = postRepository.findByUserId(userId);
        for (Post post : posts) {
            UserActivityDto dto = new UserActivityDto();
            dto.setId(post.getId());
            dto.setType(ActivityType.POST);
            dto.setTitle(post.getTitle());
            dto.setContent(post.getContent());
            dto.setCreatedAt(post.getCreatedAt());
            dto.setEntityId(post.getId());
            activities.add(dto);
        }

        // Fetch comments made by the user
        List<Comment> comments = commentRepository.findByUserId(userId);
        for (Comment comment : comments) {
            UserActivityDto dto = new UserActivityDto();
            dto.setId(comment.getId());
            dto.setType(ActivityType.COMMENT);
            dto.setTitle("Commented on a post");
            dto.setContent(comment.getContent());
            dto.setCreatedAt(comment.getCreatedAt());
            dto.setEntityId(comment.getId());
            activities.add(dto);
        }

        // Fetch groups created by the user
        List<Group> groups = groupRepository.findByOwnerId(userId);
        for (Group group : groups) {
            UserActivityDto dto = new UserActivityDto();
            dto.setId(group.getId());
            dto.setType(ActivityType.GROUP);
            dto.setTitle("Created group: " + group.getName());
            dto.setContent(group.getDescription());
            dto.setCreatedAt(group.getCreatedAt());
            dto.setEntityId(group.getId());
            activities.add(dto);
        }

        // Sort activities by createdAt descending (most recent first)
        activities.sort(Comparator.comparing(UserActivityDto::getCreatedAt).reversed());
        return activities;
    }
}
