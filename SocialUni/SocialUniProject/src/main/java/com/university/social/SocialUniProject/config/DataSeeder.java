package com.university.social.SocialUniProject.config;

import com.university.social.SocialUniProject.dto.CreateEventDto;
import com.university.social.SocialUniProject.dto.CreatePostDto;
import com.university.social.SocialUniProject.dto.CreateGroupDto;
import com.university.social.SocialUniProject.enums.Category;
import com.university.social.SocialUniProject.enums.Role;
import com.university.social.SocialUniProject.enums.Visibility;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.repositories.UserRepository;
import com.university.social.SocialUniProject.services.EventService;
import com.university.social.SocialUniProject.services.GroupServices.GroupService;
import com.university.social.SocialUniProject.services.PostServices.PostService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EventService eventService;
    private final PostService postService;
    private final GroupService groupService;

    public DataSeeder(UserRepository userRepository,
                      PasswordEncoder passwordEncoder,
                      EventService eventService,
                      PostService postService,
                      GroupService groupService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.eventService = eventService;
        this.postService = postService;
        this.groupService = groupService;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed admin user if not exists
        User admin;
        if (userRepository.findByEmail("admin123@gmail.com").isEmpty()) {
            admin = new User();
            admin.setEmail("admin123@gmail.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setUsername("admin123");
            admin.setEnabled(true);
            admin.setRole(Role.ADMIN);
            admin = userRepository.save(admin);
            System.out.println("Admin user seeded");
        } else {
            admin = userRepository.findByEmail("admin123@gmail.com").get();
            System.out.println("Admin already exists.");
        }

        // Check if groups are seeded – assuming if one group exists, then data is seeded.
        if (groupService.getAllGroups().isEmpty()) {
            seedGroups(admin.getId());
            seedPosts(admin.getId());
            seedEvents(admin.getId());
        } else {
            System.out.println("Database already seeded with groups, posts, and events.");
        }
    }

    private void seedGroups(Long userId) {
        // Create a Tech group.
        CreateGroupDto techGroup = new CreateGroupDto();
        techGroup.setName("Tech Enthusiasts");
        techGroup.setDescription("A group for technology lovers.");
        techGroup.setVisibility(Visibility.PUBLIC);
        techGroup.setCategory(Category.TECH);  // Ensure your Category enum includes TECH
        groupService.createGroup(techGroup, userId);

        // Create an Art group.
        CreateGroupDto artGroup = new CreateGroupDto();
        artGroup.setName("Art Lovers");
        artGroup.setDescription("A group for discussing art and creativity.");
        artGroup.setVisibility(Visibility.PUBLIC);
        artGroup.setCategory(Category.ART);    // Ensure your Category enum includes ART
        groupService.createGroup(artGroup, userId);

        System.out.println("Groups seeded");
    }

    private void seedPosts(Long userId) {
        // Create a welcome post.
        CreatePostDto welcomePost = new CreatePostDto();
        welcomePost.setTitle("Welcome to SocialUni!");
        welcomePost.setContent("This is our first post. Welcome everyone!");
        welcomePost.setVisibility(Visibility.PUBLIC);
        welcomePost.setCategory(Category.TECH); // Adjust index according to your Category enum ordering.
        postService.createPost(welcomePost, userId);

        // Create a tech trends post.
        CreatePostDto techPost = new CreatePostDto();
        techPost.setTitle("Latest Tech Trends");
        techPost.setContent("Check out these new tech trends...");
        techPost.setVisibility(Visibility.PUBLIC);
        techPost.setCategory(Category.TECH); // Adjust index as needed.
        postService.createPost(techPost, userId);

        System.out.println("Posts seeded");
    }

    private void seedEvents(Long userId) {
        // Create a tech meetup event.
        CreateEventDto techMeetup = new CreateEventDto();
        techMeetup.setName("Tech Meetup 2025");
        techMeetup.setDescription("Join us for a tech meetup and network with professionals.");
        techMeetup.setDate(LocalDateTime.now().plusDays(10));
        techMeetup.setLocation("City Conference Center");
        techMeetup.setCategory(Category.valueOf("TECH"));
        eventService.createEvent(techMeetup, userId);

        // Create an art exhibition event.
        CreateEventDto artExhibition = new CreateEventDto();
        artExhibition.setName("Local Art Exhibition");
        artExhibition.setDescription("Experience the local art scene with talented artists.");
        artExhibition.setDate(LocalDateTime.now().plusDays(15));
        artExhibition.setLocation("Downtown Art Gallery");
        artExhibition.setCategory(Category.valueOf("ART"));
        eventService.createEvent(artExhibition, userId);

        System.out.println("Events seeded");
    }
}
