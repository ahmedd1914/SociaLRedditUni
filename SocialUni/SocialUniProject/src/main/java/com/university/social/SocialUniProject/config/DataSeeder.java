package com.university.social.SocialUniProject.config;

import com.university.social.SocialUniProject.models.Enums.Role;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // ✅ Check if an admin already exists
        if (userRepository.findByEmail("admin@example.com").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("Admin123!")); // ✅ Hash password
            admin.setUsername("Admin");
            admin.setEnabled(true);
            admin.setRole(Role.ADMIN);

            userRepository.save(admin);
            System.out.println("✅ Admin user seeded: admin@example.com / Admin123!");
        } else {
            System.out.println("✅ Admin already exists.");
        }
    }
}
