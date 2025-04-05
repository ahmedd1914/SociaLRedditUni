package com.university.social.SocialUniProject.services.UserServices;

import com.university.social.SocialUniProject.models.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${security.jwt.secret-key}")
    private String secretKey;

    @Value("${security.jwt.expiration-time}")
    private long jwtExpiration;

    /**
     * Extracts the 'sub' field (userId) from the JWT's payload.
     */
    public String extractUserId(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts the 'role' claim we store inside the JWT (e.g., "ROLE_ADMIN" or "ROLE_USER").
     */
    public String extractUserRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    /**
     * Extracts any claim using a custom resolver function.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Generates a token for a given user entity, embedding userId as 'sub' and user role as 'role'.
     */
    public String generateTokenForUser(User user) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", "ROLE_" + user.getRole().name()); // Add ROLE_ prefix
        return buildToken(extraClaims, String.valueOf(user.getId()), jwtExpiration);
    }

    /**
     * (Optional) Overload if you only want to pass userId (no role).
     */
    public String generateToken(String userId) {
        return buildToken(new HashMap<>(), userId, jwtExpiration);
    }

    /**
     * The main builder method.
     */
    private String buildToken(
            Map<String, Object> extraClaims,
            String userId,
            long expiration
    ) {
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userId)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Validates if the token belongs to the given user and is not expired.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String extractedUserId = extractUserId(token);
        final String expectedUserId = String.valueOf(((User) userDetails).getId());
        final String extractedRole = extractUserRole(token);
        final String expectedRole = "ROLE_" + ((User) userDetails).getRole().name();
        
        return (extractedUserId.equals(expectedUserId)) && 
               (extractedRole.equals(expectedRole)) && 
               !isTokenExpired(token);
    }

    /**
     * Determines if the token is expired.
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Parses and returns all claims from the token.
     */
    private Claims extractAllClaims(String token) {
        JwtParser parser = Jwts.parser()
                .verifyWith(getSignInKey())
                .build();
        return parser.parseSignedClaims(token).getPayload();
    }

    /**
     * Uses the Base64-decoded secret to form the signing key.
     */
    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public long getExpirationTime() {
        return jwtExpiration;
    }
}
