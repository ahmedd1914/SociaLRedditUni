package com.university.social.SocialUniProject.config;

import com.university.social.SocialUniProject.dto.UserDto.TokenBlacklistService;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.services.UserServices.JwtService;
import com.university.social.SocialUniProject.services.UserServices.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final HandlerExceptionResolver handlerExceptionResolver;
    private final JwtService jwtService;
    private final UserService userService;
    private final TokenBlacklistService tokenBlacklistService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserService userService,
            HandlerExceptionResolver handlerExceptionResolver,
            TokenBlacklistService tokenBlacklistService
    ) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.handlerExceptionResolver = handlerExceptionResolver;
        this.tokenBlacklistService = tokenBlacklistService;
    }
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/auth/login")
                || path.startsWith("/auth/signup")
                || path.startsWith("/auth/verify")
                || path.startsWith("/auth/resend")
                || path.startsWith("/auth/logout");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        System.out.println("JWT Filter processing request: " + request.getRequestURI());

        final String authHeader = request.getHeader("Authorization");

        // 1) Check if we have a Bearer token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("No valid Authorization header found.");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 2) Extract the JWT from the header
            final String jwt = authHeader.substring(7);
            System.out.println("Extracted JWT: " + jwt);

            // 3) Check if token is blacklisted
            if (tokenBlacklistService.isTokenBlacklisted(jwt)) {
                System.out.println("❌ Token is blacklisted. Skipping authentication.");
                // Do NOT set authentication in the context
                filterChain.doFilter(request, response);
                return;
            }

            // 4) Extract user ID from JWT
            final String userId = jwtService.extractUserId(jwt);
            System.out.println("Extracted UserId: " + userId);

            // 5) Check if there's already authentication
            Authentication existingAuth = SecurityContextHolder.getContext().getAuthentication();

            if (userId != null && existingAuth == null) {
                // 6) Load the user by ID
                User user = userService.loadUserById(Long.parseLong(userId));

                System.out.println("🔍 Comparing JWT UserId vs Database UserId:");
                System.out.println("🔍 JWT UserId: " + userId);
                System.out.println("🔍 Database UserId: " + user.getId());

                // 7) Validate token correctness (expiry, signature, user match, etc.)
                if (jwtService.isTokenValid(jwt, user)) {
                    System.out.println("✅ JWT is valid for user: " + user.getUsername());

                    // 8) Build an authentication token and set it in security context
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            user.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    System.out.println("❌ JWT is invalid for user: " + userId);
                }
            }
        } catch (Exception exception) {
            System.out.println("JWT Authentication Failed: " + exception.getMessage());
            handlerExceptionResolver.resolveException(request, response, null, exception);
            return;
        }

        // 9) Continue the filter chain
        filterChain.doFilter(request, response);
    }
}
