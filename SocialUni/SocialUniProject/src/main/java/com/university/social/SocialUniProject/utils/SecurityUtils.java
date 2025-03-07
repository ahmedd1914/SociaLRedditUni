package com.university.social.SocialUniProject.utils;

import com.university.social.SocialUniProject.exceptions.UnauthorizedActionException;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    private static UserRepository staticUserRepository;
    @Autowired
    public SecurityUtils(UserRepository userRepository) {
        staticUserRepository = userRepository;
    }

    public static Long getAuthenticatedUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;

        if (principal instanceof String) {
            // Sometimes the principal might just be a username string.
            username = (String) principal;
        } else if (principal instanceof UserDetails) {
            // More commonly, it's a UserDetails instance.
            username = ((UserDetails) principal).getUsername();
        } else {
            username = null;
        }

        if (username != null) {
            User user = staticUserRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username));
            return user.getId();
        }

        throw new IllegalArgumentException("Authenticated principal is not a recognized type.");
    }



    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals(role));
    }
}
