package com.university.social.SocialUniProject.services.PostServices;

import com.university.social.SocialUniProject.dto.PostDto.ReactionDto;
import com.university.social.SocialUniProject.models.Post;
import com.university.social.SocialUniProject.models.Reaction;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.repositories.PostRepository;
import com.university.social.SocialUniProject.repositories.ReactionRepository;
import com.university.social.SocialUniProject.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ReactionService {

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    public String reactToPost(Long userId, ReactionDto reactionDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(reactionDto.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Optional<Reaction> existingReaction = reactionRepository.findByUserAndPost(user, post);

        if (existingReaction.isPresent()) {
            Reaction reaction = existingReaction.get();
            if (reaction.getType().equals(reactionDto.getType())) {
                reactionRepository.delete(reaction); // Remove reaction if it's the same type
                return "Reaction removed";
            } else {
                reaction.setType(reactionDto.getType());
                reactionRepository.save(reaction); // Update reaction type
                return "Reaction updated";
            }
        } else {
            Reaction newReaction = new Reaction(reactionDto.getType(), user, post);
            reactionRepository.save(newReaction);
            return "Reaction added";
        }
    }
}

