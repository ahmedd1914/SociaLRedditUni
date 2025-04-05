package com.university.social.SocialUniProject.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            AuthenticationProvider authenticationProvider
    ) {
        this.authenticationProvider = authenticationProvider;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                // 1. Enable CORS with our custom configuration
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. Disable CSRF for token-based authentication
                .csrf(csrf -> csrf.disable())

                // 3. Use stateless sessions
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. Configure route access
                .authorizeHttpRequests(auth -> auth
                        // Auth endpoints - explicitly allow access without authentication
                        .requestMatchers("/auth/login").permitAll()
                        .requestMatchers("/auth/signup").permitAll()
                        .requestMatchers("/auth/verify").permitAll()
                        .requestMatchers("/auth/resend").permitAll()
                        .requestMatchers("/auth/logout").permitAll()
                        
                        // Public endpoints
                        .requestMatchers(HttpMethod.GET, "/posts/public").permitAll()
                        .requestMatchers(HttpMethod.GET, "/posts/trending").permitAll()
                        .requestMatchers(HttpMethod.GET, "/admin/posts/trending").permitAll()

                        // Reaction endpoints
                        .requestMatchers(HttpMethod.POST, "/reactions/react").authenticated()
                        .requestMatchers(HttpMethod.GET, "/reactions/user/post/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/reactions/user/post/**").authenticated()

                        // Admin endpoints require ADMIN role
                        .requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN")

                        // User endpoints
                        .requestMatchers(HttpMethod.GET, "/users/me").authenticated()

                        // Swagger endpoints
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/configuration/ui",
                                "/configuration/security",
                                "/webjars/**"
                        ).permitAll()

                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                )

                // 5. Apply authentication provider and JWT filter
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                // 6. Build the configuration
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // Adjust these as needed for your frontends
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",    // React dev server
                "http://localhost:3000",    // React dev server alternative port
                "http://localhost:8080",    // If you have any self-calls
                "https://app-backend.com"   // Example domain
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Type"));
        // Allow credentials for cookies/sessions
        configuration.setAllowCredentials(true);
        // Set max age for preflight requests
        configuration.setMaxAge(3600L);
        
        // Apply this CORS config to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SocialUni API")
                        .version("1.0")
                        .description("API documentation for SocialUniProject"))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components().addSecuritySchemes("Bearer Authentication",
                        new SecurityScheme().name("Bearer Authentication")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
