package com.university.social.SocialUniProject.services.UserServices;

import com.university.social.SocialUniProject.dto.UserDto.LoginUserDto;
import com.university.social.SocialUniProject.dto.UserDto.RegisterUserDto;
import com.university.social.SocialUniProject.dto.UserDto.VerifyUserDto;
import com.university.social.SocialUniProject.dto.CreateNotificationDto;
import com.university.social.SocialUniProject.exceptions.ResourceNotFoundException;
import com.university.social.SocialUniProject.models.User;
import com.university.social.SocialUniProject.repositories.UserRepository;
import com.university.social.SocialUniProject.services.NotificationService;
import com.university.social.SocialUniProject.enums.NotificationType;
import jakarta.mail.MessagingException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import static com.university.social.SocialUniProject.enums.Role.USER;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final NotificationService notificationService;

    public AuthenticationService(
            UserRepository userRepository,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            JwtService jwtService,
            NotificationService notificationService
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.jwtService = jwtService;
        this.notificationService = notificationService;
    }

    /**
     * Registers a new user with 'ROLE_USER', generates a verification code,
     * and returns a JWT that contains userId + role claim.
     */
    public String signup(RegisterUserDto input) {
        User user = new User(
                input.getUsername(),
                input.getEmail(),
                passwordEncoder.encode(input.getPassword())
        );

        // Assign default role (e.g. 'USER')
        user.setRole(USER);

        // Generate verification details
        user.setVerificationCode(generateVerificationCode());
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
        user.setEnabled(false);

        // Send email before saving
        sendVerificationEmail(user);
        user.setLastLogin(null);
        user.setCreatedAt(LocalDateTime.now());
        // Persist user in DB
        user = userRepository.save(user);

        // Create welcome notification
        notificationService.createNotification(new CreateNotificationDto(
                "Welcome to SocialUni! Please verify your email to get started.",
                NotificationType.USER_REGISTERED,
                user.getId(),
                null,
                null
        ));

        // Return JWT containing userId + role
        return jwtService.generateTokenForUser(user);
    }

    /**
     * Authenticates an existing user by email/password, and returns a fresh JWT.
     */
    public String authenticate(LoginUserDto input) {
        // Spring Security checks password
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(input.getEmail(), input.getPassword())
        );

        // Find user
        User user = userRepository.findByEmail(input.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        System.out.println("✅ Last login updated in database: " + user.getLastLogin());

        // Return JWT containing userId + role
        return jwtService.generateTokenForUser(user);
    }

    /**
     * Verifies the user's account by matching JWT userId with code in DB.
     */
    public void verifyUserByJwt(String jwt, String inputCode) {
        // 1) Extract userId from the JWT
        String userIdString = jwtService.extractUserId(jwt);
        Long userId = Long.valueOf(userIdString);

        // 2) Load user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 3) Check if code is present
        if (user.getVerificationCode() == null) {
            throw new IllegalArgumentException("No verification code set (user might be already verified)");
        }

        // 4) Check expiration
        if (user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code has expired");
        }

        // 5) Compare
        if (!user.getVerificationCode().equals(inputCode)) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        // 6) Enable user
        user.setEnabled(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiresAt(null);
        userRepository.save(user);
    }

    /**
     * Re-sends verification code if the user is not already enabled.
     */
    public void resendVerificationCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.isEnabled()) {
            throw new IllegalStateException("Account is already verified");
        }

        user.setVerificationCode(generateVerificationCode());
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusHours(1));
        sendVerificationEmail(user);
        userRepository.save(user);
    }

    /**
     * Helper to send verification email with a code.
     */
    private void sendVerificationEmail(User user) {
        String subject = "Account Verification";
        String verificationCode = "VERIFICATION CODE " + user.getVerificationCode();
        String htmlMessage = "<html>"
                + "<body style=\"font-family: Arial, sans-serif;\">"
                + "<div style=\"background-color: #f5f5f5; padding: 20px;\">"
                + "<h2 style=\"color: #333;\">Welcome to our app!</h2>"
                + "<p style=\"font-size: 16px;\">Please enter the verification code below to continue:</p>"
                + "<div style=\"background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);\">"
                + "<h3 style=\"color: #333;\">Verification Code:</h3>"
                + "<p style=\"font-size: 18px; font-weight: bold; color: #007bff;\">" + verificationCode + "</p>"
                + "</div>"
                + "</div>"
                + "</body>"
                + "</html>";

        try {
            emailService.sendVerificationEmail(user.getEmail(), subject, htmlMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    /**
     * Generates a random 6-digit verification code.
     */
    private String generateVerificationCode() {
        SecureRandom secureRandom = new SecureRandom();
        int code = secureRandom.nextInt(900000) + 100000; // 100000..999999
        return String.valueOf(code);
    }
}
