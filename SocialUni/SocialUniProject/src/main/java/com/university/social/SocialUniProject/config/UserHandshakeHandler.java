package com.university.social.SocialUniProject.config;

import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.services.UserServices.JwtService;
import com.university.social.SocialUniProject.services.UserServices.UserService;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.util.MultiValueMap;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.security.Principal;
import java.util.List;
import java.util.Map;

public class UserHandshakeHandler extends DefaultHandshakeHandler {

    private final JwtService jwtService;
    private final UserService userService;

    public UserHandshakeHandler(JwtService jwtService, UserService userService) {
        this.jwtService = jwtService;
        this.userService = userService;
    }

    @Override
    protected Principal determineUser(ServerHttpRequest request,
                                      WebSocketHandler wsHandler,
                                      Map<String, Object> attributes) {
        String token = null;
        // Try to get token from Authorization header
        List<String> authHeaders = request.getHeaders().get("Authorization");
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String bearerToken = authHeaders.get(0);
            if (bearerToken.startsWith("Bearer ")) {
                token = bearerToken.substring(7);
            }
        }
        // Optionally, also check for a token query parameter if header is missing
        if (token == null) {
            URI uri = request.getURI();
            MultiValueMap<String, String> queryParams = UriComponentsBuilder.fromUri(uri).build().getQueryParams();
            if (queryParams.containsKey("token")) {
                token = queryParams.getFirst("token");
            }
        }
        // Validate token and create a Principal
        if (token != null) {
            try {
                String userId = jwtService.extractUserId(token);
                User user = userService.loadUserById(Long.parseLong(userId));
                if (jwtService.isTokenValid(token, user)) {
                    // Return a simple Principal containing the user ID.
                    return () -> String.valueOf(user.getId());
                }
            } catch (Exception e) {
                // Token invalid; log or handle as needed
                System.out.println("WebSocket JWT validation failed: " + e.getMessage());
            }
        }
        // If no valid token, no Principal is set and the handshake can be rejected.
        return null;
    }
}
