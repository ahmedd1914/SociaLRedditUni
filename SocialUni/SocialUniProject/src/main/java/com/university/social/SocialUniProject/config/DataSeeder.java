package com.university.social.SocialUniProject.config;

import com.university.social.SocialUniProject.dto.CreateEventDto;
import com.university.social.SocialUniProject.dto.CreatePostDto;
import com.university.social.SocialUniProject.dto.CreateGroupDto;
import com.university.social.SocialUniProject.dto.CreateCommentDto;
import com.university.social.SocialUniProject.dto.CreateReactionDto;
import com.university.social.SocialUniProject.dto.CreateUserDto;
import com.university.social.SocialUniProject.dto.ReactionDto;
import com.university.social.SocialUniProject.enums.Category;
import com.university.social.SocialUniProject.enums.Role;
import com.university.social.SocialUniProject.enums.Visibility;
import com.university.social.SocialUniProject.enums.ReactionType;
import com.university.social.SocialUniProject.enums.EventPrivacy;
import com.university.social.SocialUniProject.exceptions.ResourceNotFoundException;
import com.university.social.SocialUniProject.models.Group;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.repositories.UserRepository;
import com.university.social.SocialUniProject.repositories.GroupRepository;
import com.university.social.SocialUniProject.responses.GroupResponseDto;
import com.university.social.SocialUniProject.responses.PostResponseDto;
import com.university.social.SocialUniProject.responses.CommentResponseDto;
import com.university.social.SocialUniProject.responses.EventResponseDto;
import com.university.social.SocialUniProject.services.EventService;
import com.university.social.SocialUniProject.services.GroupServices.GroupService;
import com.university.social.SocialUniProject.services.PostServices.PostService;
import com.university.social.SocialUniProject.services.CommentService;
import com.university.social.SocialUniProject.services.PostServices.ReactionService;
import com.university.social.SocialUniProject.services.UserServices.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.Map;
import java.util.HashMap;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;
    private final GroupService groupService;
    private final PostService postService;
    private final CommentService commentService;
    private final ReactionService reactionService;
    private final EventService eventService;
    private final GroupRepository groupRepository;
    private final Random random = new Random();

    @Autowired
    public DataSeeder(UserRepository userRepository,
                      PasswordEncoder passwordEncoder,
                      UserService userService,
                      GroupService groupService,
                      PostService postService,
                      CommentService commentService,
                      ReactionService reactionService,
                      EventService eventService,
                      GroupRepository groupRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userService = userService;
        this.groupService = groupService;
        this.postService = postService;
        this.commentService = commentService;
        this.reactionService = reactionService;
        this.eventService = eventService;
        this.groupRepository = groupRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        try {
            System.out.println("Starting data seeding process...");
            
            // Check if data has already been seeded
            if (isDataAlreadySeeded()) {
                System.out.println("Data has already been seeded. Skipping seeding process.");
                return;
            }
            
            // Seed users with different roles
            System.out.println("Seeding users...");
            List<User> users = seedUsers();
            System.out.println("Users seeded successfully. Total users: " + users.size());
            
            User admin = users.stream().filter(u -> u.getRole() == Role.ADMIN).findFirst().orElse(null);
            
            if (admin == null) {
                System.out.println("Admin user not found. Cannot proceed with seeding.");
                return;
            }
            System.out.println("Admin user found. Proceeding with seeding other entities...");

            // Always proceed with seeding other entities
            System.out.println("Seeding groups, posts, comments, reactions, and events...");
            
            try {
                // Seed groups
                System.out.println("Seeding groups...");
                List<Long> groupIds = seedGroups(users);
                System.out.println("Groups seeded successfully. Total groups: " + groupIds.size());
                
                // Seed posts
                System.out.println("Seeding posts...");
                List<Long> postIds = seedPosts(users, groupIds);
                System.out.println("Posts seeded successfully. Total posts: " + postIds.size());
                
                // Seed comments
                System.out.println("Seeding comments...");
                List<Long> commentIds = seedComments(users, postIds);
                System.out.println("Comments seeded successfully. Total comments: " + commentIds.size());
                
                // Seed reactions
                System.out.println("Seeding reactions...");
                seedReactions(users, postIds, commentIds);
                System.out.println("Reactions seeded successfully.");
                
                // Seed events
                System.out.println("Seeding events...");
                List<Long> eventIds = seedEvents(users);
                System.out.println("Events seeded successfully. Total events: " + eventIds.size());
                
                System.out.println("Database successfully seeded with test data.");
            } catch (Exception e) {
                System.err.println("Error during entity seeding: " + e.getMessage());
                e.printStackTrace();
            }
        } catch (Exception e) {
            System.err.println("Error during data seeding: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Checks if data has already been seeded by looking for existing entities
     * @return true if data has already been seeded, false otherwise
     */
    private boolean isDataAlreadySeeded() {
        // Check if we have users, groups, posts, etc.
        boolean hasUsers = userRepository.count() > 0;
        boolean hasGroups = groupRepository.count() > 0;
        
        // If we have both users and groups, assume data is already seeded
        if (hasUsers && hasGroups) {
            return true;
        }
        
        return false;
    }

    @Transactional
    protected List<User> seedUsers() {
        List<User> users = new ArrayList<>();
        
        // Admin user
        User admin;
        if (userRepository.findByEmail("admin123@gmail.com").isEmpty()) {
            admin = new User();
            admin.setEmail("admin123@gmail.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setUsername("admin123");
            admin.setFName("Admin");
            admin.setLName("User");
            admin.setEnabled(true);
            admin.setRole(Role.ADMIN);
            admin.setCreatedAt(LocalDateTime.now());
            admin = userRepository.save(admin);
            System.out.println("Admin user seeded");
        } else {
            admin = userRepository.findByEmail("admin123@gmail.com").get();
            System.out.println("Admin already exists.");
        }
        users.add(admin);
        
        // Regular users
        String[] usernames = {"john_doe", "jane_smith", "alex_johnson", "sarah_williams", "mike_brown"};
        String[] firstNames = {"John", "Jane", "Alex", "Sarah", "Mike"};
        String[] lastNames = {"Doe", "Smith", "Johnson", "Williams", "Brown"};
        
        for (int i = 0; i < usernames.length; i++) {
            String email = usernames[i] + "@example.com";
            if (userRepository.findByEmail(email).isEmpty()) {
                User user = new User();
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode("password123"));
                user.setUsername(usernames[i]);
                user.setFName(firstNames[i]);
                user.setLName(lastNames[i]);
                user.setEnabled(true);
                user.setRole(Role.USER);
                user.setCreatedAt(LocalDateTime.now());
                user = userRepository.save(user);
                System.out.println("User seeded: " + usernames[i]);
                users.add(user);
            } else {
                User existingUser = userRepository.findByEmail(email).get();
                System.out.println("User already exists: " + usernames[i]);
                users.add(existingUser);
            }
        }
        
        // Moderator user
        User moderator;
        if (userRepository.findByEmail("moderator@gmail.com").isEmpty()) {
            moderator = new User();
            moderator.setEmail("moderator@gmail.com");
            moderator.setPassword(passwordEncoder.encode("moderator123"));
            moderator.setUsername("moderator");
            moderator.setFName("Moderator");
            moderator.setLName("User");
            moderator.setEnabled(true);
            moderator.setRole(Role.MODERATOR);
            moderator.setCreatedAt(LocalDateTime.now());
            moderator = userRepository.save(moderator);
            System.out.println("Moderator user seeded");
        } else {
            moderator = userRepository.findByEmail("moderator@gmail.com").get();
            System.out.println("Moderator already exists.");
        }
        users.add(moderator);
        
        return users;
    }

    @Transactional
    protected List<Long> seedGroups(List<User> users) {
        List<Long> groupIds = new ArrayList<>();
        
        System.out.println("Starting to seed groups...");
        System.out.println("Number of users available for group creation: " + users.size());
        
        // Create groups with different categories
        String[] groupNames = {
            "Tech Enthusiasts", "Art Lovers", "Sports Fans", 
            "Book Club", "Music Makers", "Science Explorers",
            "Travel Adventures", "Foodies", "Photography Enthusiasts",
            "Gaming Community"
        };
        
        String[] groupDescriptions = {
            "A group for technology lovers and enthusiasts.",
            "A group for discussing art and creativity.",
            "A group for sports fans to discuss their favorite teams.",
            "A group for book lovers to discuss literature.",
            "A group for musicians and music lovers.",
            "A group for science enthusiasts to discuss discoveries.",
            "A group for travel enthusiasts to share experiences.",
            "A group for food lovers to share recipes and experiences.",
            "A group for photography enthusiasts to share their work.",
            "A group for gamers to discuss games and strategies."
        };
        
        Category[] categories = {
            Category.TECH, Category.ART, Category.SPORTS,
            Category.GENERAL, Category.MUSIC, Category.SCIENCE,
            Category.ENTERTAINMENT, Category.DISCUSSION, Category.PROJECT,
            Category.GAMING
        };
        
        for (int i = 0; i < groupNames.length; i++) {
            try {
                System.out.println("Creating group: " + groupNames[i]);
                CreateGroupDto group = new CreateGroupDto();
                group.setName(groupNames[i]);
                group.setDescription(groupDescriptions[i]);
                group.setVisibility(Visibility.PUBLIC);
                group.setCategory(categories[i]);
                
                // Assign a random user as creator
                User creator = users.get(random.nextInt(users.size()));
                System.out.println("Selected creator: " + creator.getUsername() + " (ID: " + creator.getId() + ")");
                
                GroupResponseDto groupResponse = groupService.createGroup(group, creator.getId());
                groupIds.add(groupResponse.getId());
                System.out.println("Successfully created group: " + groupNames[i] + " (ID: " + groupResponse.getId() + ")");
            } catch (Exception e) {
                System.err.println("Error creating group " + groupNames[i] + ": " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        System.out.println("Finished seeding groups. Total groups created: " + groupIds.size());
        return groupIds;
    }

    @Transactional
    protected List<Long> seedPosts(List<User> users, List<Long> groupIds) {
        List<Long> postIds = new ArrayList<>();
        
        if (groupIds.isEmpty()) {
            System.out.println("No groups available for creating posts. Skipping post creation.");
            return postIds;
        }
        
        // Create posts with different categories
        String[] postTitles = {
            "Welcome to SocialUni!", "Latest Tech Trends", "Art Exhibition This Weekend",
            "Football Match Results", "Book Recommendations", "New Music Release",
            "Scientific Discovery", "Travel Destinations", "Recipe of the Week",
            "Photography Tips", "Gaming News", "University Events"
        };
        
        String[] postContents = {
            "This is our first post. Welcome everyone to SocialUni!",
            "Check out these new tech trends that are shaping our future...",
            "Don't miss the art exhibition happening this weekend at the local gallery.",
            "The latest football match results are in. Our team won!",
            "Here are some book recommendations for your reading list.",
            "The new album from my favorite artist just dropped. Check it out!",
            "Scientists have made a breakthrough discovery in quantum physics.",
            "Here are some amazing travel destinations for your next vacation.",
            "Try this delicious recipe for homemade pasta.",
            "Here are some tips to improve your photography skills.",
            "The latest gaming news and updates from E3.",
            "Check out the upcoming events at our university."
        };
        
        Category[] categories = {
            Category.GENERAL, Category.TECH, Category.ART,
            Category.SPORTS, Category.DISCUSSION, Category.MUSIC,
            Category.SCIENCE, Category.ENTERTAINMENT, Category.PROJECT,
            Category.ANNOUNCEMENT, Category.GAMING, Category.GENERAL
        };
        
        // First, get all groups with their members
        Map<Long, Group> groupsMap = new HashMap<>();
        for (Long groupId : groupIds) {
            try {
                // Get the group entity directly from the repository
                Group group = groupRepository.findById(groupId)
                    .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID: " + groupId));
                
                // Initialize the collections to avoid LazyInitializationException
                group.getMembers().size();
                group.getAdmins().size();
                
                groupsMap.put(groupId, group);
                System.out.println("Loaded group: " + group.getName() + " with " + 
                    group.getMembers().size() + " members and " + 
                    group.getAdmins().size() + " admins");
            } catch (Exception e) {
                System.err.println("Error loading group " + groupId + ": " + e.getMessage());
            }
        }
        
        for (int i = 0; i < postTitles.length; i++) {
            try {
                System.out.println("Creating post: " + postTitles[i]);
                CreatePostDto post = new CreatePostDto();
                post.setTitle(postTitles[i]);
                post.setContent(postContents[i]);
                post.setVisibility(Visibility.PUBLIC);
                post.setCategory(categories[i]);
                
                // Always assign a group ID (required field)
                Long groupId = groupIds.get(i % groupIds.size()); // Cycle through available groups
                post.setGroupId(groupId);
                System.out.println("Assigning post to group ID: " + groupId);
                
                // Get the group and find a user who is a member
                Group group = groupsMap.get(groupId);
                if (group == null) {
                    System.err.println("Group not found: " + groupId + ". Skipping post creation.");
                    continue;
                }
                
                // Find a user who is a member of the group
                User creator = null;
                List<User> potentialCreators = new ArrayList<>();
                
                // Add group owner
                potentialCreators.add(group.getOwner());
                
                // Add group members
                potentialCreators.addAll(group.getMembers());
                
                // Add group admins
                potentialCreators.addAll(group.getAdmins());
                
                if (!potentialCreators.isEmpty()) {
                    creator = potentialCreators.get(random.nextInt(potentialCreators.size()));
                    System.out.println("Selected creator: " + creator.getUsername() + " (ID: " + creator.getId() + ")");
                } else {
                    System.err.println("No members found in group: " + group.getName() + ". Skipping post creation.");
                    continue;
                }
                
                PostResponseDto postResponse = postService.createPost(post, creator.getId());
                postIds.add(postResponse.getId());
                System.out.println("Successfully created post: " + postTitles[i] + " (ID: " + postResponse.getId() + ")");
            } catch (Exception e) {
                System.err.println("Error creating post " + postTitles[i] + ": " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        System.out.println("Finished seeding posts. Total posts created: " + postIds.size());
        return postIds;
    }

    @Transactional
    protected List<Long> seedComments(List<User> users, List<Long> postIds) {
        List<Long> commentIds = new ArrayList<>();
        
        // Create comments for posts
        String[] commentContents = {
            "Great post! Thanks for sharing.",
            "I completely agree with this.",
            "Interesting perspective, I hadn't thought of that.",
            "This is really helpful information.",
            "I have a different opinion on this topic.",
            "Thanks for the update!",
            "Looking forward to more content like this.",
            "This is exactly what I needed.",
            "I'm not sure I understand this point.",
            "Can you elaborate more on this?"
        };
        
        // Create 2-5 comments for each post
        for (Long postId : postIds) {
            int numComments = random.nextInt(4) + 2; // 2-5 comments
            
            for (int i = 0; i < numComments; i++) {
                CreateCommentDto comment = new CreateCommentDto();
                comment.setContent(commentContents[random.nextInt(commentContents.length)]);
                comment.setPostId(postId);
                comment.setVisibility(Visibility.PUBLIC);
                
                // Assign a random user as creator
                User creator = users.get(random.nextInt(users.size()));
                
                // 30% chance to be a reply to another comment
                if (random.nextDouble() < 0.3 && !commentIds.isEmpty()) {
                    Long parentCommentId = commentIds.get(random.nextInt(commentIds.size()));
                    comment.setParentCommentId(parentCommentId);
                }
                
                CommentResponseDto commentResponse = commentService.createComment(creator.getId(), comment);
                commentIds.add(commentResponse.getId());
                System.out.println("Comment seeded for post: " + postId);
            }
        }
        
        return commentIds;
    }

    @Transactional
    protected void seedReactions(List<User> users, List<Long> postIds, List<Long> commentIds) {
        // Create reactions for posts
        for (Long postId : postIds) {
            // 3-8 reactions per post
            int numReactions = random.nextInt(6) + 3;
            
            for (int i = 0; i < numReactions; i++) {
                CreateReactionDto reaction = new CreateReactionDto();
                reaction.setPostId(postId);
                reaction.setType(ReactionType.values()[random.nextInt(ReactionType.values().length)]);
                
                // Assign a random user
                User user = users.get(random.nextInt(users.size()));
                
                ReactionDto reactionDto = new ReactionDto();
                reactionDto.setType(reaction.getType());
                reactionDto.setPostId(reaction.getPostId());
                reactionDto.setCommentId(reaction.getCommentId());
                reactionService.react(user.getId(), reactionDto);
                System.out.println("Reaction seeded for post: " + postId);
            }
        }
        
        // Create reactions for comments
        for (Long commentId : commentIds) {
            // 1-5 reactions per comment
            int numReactions = random.nextInt(5) + 1;
            
            for (int i = 0; i < numReactions; i++) {
                CreateReactionDto reaction = new CreateReactionDto();
                reaction.setCommentId(commentId);
                reaction.setType(ReactionType.values()[random.nextInt(ReactionType.values().length)]);
                
                // Assign a random user
                User user = users.get(random.nextInt(users.size()));
                
                ReactionDto reactionDto = new ReactionDto();
                reactionDto.setType(reaction.getType());
                reactionDto.setPostId(reaction.getPostId());
                reactionDto.setCommentId(reaction.getCommentId());
                reactionService.react(user.getId(), reactionDto);
                System.out.println("Reaction seeded for comment: " + commentId);
            }
        }
    }

    @Transactional
    protected List<Long> seedEvents(List<User> users) {
        List<Long> eventIds = new ArrayList<>();
        
        // Create events with different categories
        String[] eventNames = {
            "Tech Meetup 2025", "Local Art Exhibition", "Sports Tournament",
            "Book Reading Session", "Music Festival", "Science Fair",
            "Travel Workshop", "Cooking Class", "Photography Workshop",
            "Gaming Tournament", "University Graduation", "Career Fair"
        };
        
        String[] eventDescriptions = {
            "Join us for a tech meetup and network with professionals.",
            "Experience the local art scene with talented artists.",
            "Participate in our annual sports tournament.",
            "Join us for a book reading session with a local author.",
            "Enjoy live music from various artists at our music festival.",
            "Explore the latest scientific discoveries at our science fair.",
            "Learn about travel planning and destinations at our workshop.",
            "Learn to cook delicious dishes at our cooking class.",
            "Improve your photography skills at our workshop.",
            "Compete with other gamers in our tournament.",
            "Celebrate the graduation of our students.",
            "Meet potential employers at our career fair."
        };
        
        Category[] categories = {
            Category.TECH, Category.ART, Category.SPORTS,
            Category.GENERAL, Category.MUSIC, Category.SCIENCE,
            Category.ENTERTAINMENT, Category.DISCUSSION, Category.PROJECT,
            Category.GAMING, Category.GENERAL, Category.GENERAL
        };
        
        for (int i = 0; i < eventNames.length; i++) {
            CreateEventDto event = new CreateEventDto();
            event.setName(eventNames[i]);
            event.setDescription(eventDescriptions[i]);
            event.setDate(LocalDateTime.now().plusDays(random.nextInt(30) + 1));
            event.setLocation("Location " + (i + 1));
            event.setCategory(categories[i]);
            event.setPrivacy(random.nextBoolean() ? EventPrivacy.PUBLIC : EventPrivacy.INVITATION_ONLY);
            
            // Assign a random user as creator
            User creator = users.get(random.nextInt(users.size()));
            
            EventResponseDto eventResponse = eventService.createEvent(event, creator.getId());
            eventIds.add(eventResponse.getId());
            System.out.println("Event seeded: " + eventNames[i]);
        }
        
        return eventIds;
    }
}
