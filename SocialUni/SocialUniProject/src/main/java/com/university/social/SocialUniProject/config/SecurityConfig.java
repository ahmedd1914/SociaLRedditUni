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
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Auth endpoints
                .requestMatchers(
                    "/auth/login",
                    "/auth/signup",
                    "/auth/verify",
                    "/auth/resend",
                    "/auth/logout"
                ).permitAll()
                
                // Public endpoints
                .requestMatchers(HttpMethod.GET, "/posts/public/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/posts/trending").permitAll()
                .requestMatchers(HttpMethod.GET, "/admin/posts/trending").permitAll()
                .requestMatchers(HttpMethod.GET, "/users/profile/*/public").permitAll()
                .requestMatchers(HttpMethod.GET, "/users/profile/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/users/{id}").authenticated()

                // Swagger endpoints
                .requestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/swagger-resources/**",
                    "/configuration/ui",
                    "/configuration/security",
                    "/webjars/**"
                ).permitAll()

                // Admin endpoints
                .requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN")

                // User endpoints
                .requestMatchers("/users/me").authenticated()
                .requestMatchers(HttpMethod.GET, "/users/profile/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/users/profile/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/users/profile/**").hasAuthority("ROLE_ADMIN")

                // Reaction endpoints
                .requestMatchers(HttpMethod.POST, "/reactions/react").authenticated()
                .requestMatchers(HttpMethod.GET, "/reactions/user/post/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/reactions/user/post/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/reactions/user/comment/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/reactions/user/comment/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/reactions/comment/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/reactions/comment/**").authenticated()

                // All other requests need authentication
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow all origins in development
        configuration.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:8080",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8080"
        ));
        
        // Allow all common methods
        configuration.setAllowedMethods(List.of(
            "GET", "POST", "PUT", "PATCH", 
            "DELETE", "OPTIONS", "HEAD"
        ));
        
        // Allow all common headers
        configuration.setAllowedHeaders(List.of(
            "Authorization",
            "Content-Type",
            "Accept",
            "Accept-Language",
            "Origin",
            "X-Requested-With",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        
        // Expose necessary response headers
        configuration.setExposedHeaders(List.of(
            "Authorization",
            "Content-Type",
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials"
        ));
        
        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        
        // Cache preflight requests for 1 hour
        configuration.setMaxAge(3600L);
        
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
