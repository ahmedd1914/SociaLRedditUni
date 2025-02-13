package com.university.social.SocialUniProject.controllers;

import com.university.social.SocialUniProject.dto.UserDto.LoginUserDto;
import com.university.social.SocialUniProject.dto.UserDto.RegisterUserDto;
import com.university.social.SocialUniProject.dto.UserDto.VerifyUserDto;
import com.university.social.SocialUniProject.responses.LoginResponse;
import com.university.social.SocialUniProject.services.UserServices.AuthenticationService;
import com.university.social.SocialUniProject.services.UserServices.JwtService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/auth")
@RestController
public class AuthController {
    private final JwtService jwtService;
    private final AuthenticationService authenticationService;

    public AuthController(JwtService jwtService, AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/signup")
    public ResponseEntity<String> register(@RequestBody RegisterUserDto registerUserDto) {
        String jwtToken = authenticationService.signup(registerUserDto);
        return ResponseEntity.ok(jwtToken); // Return JWT token on signup
    }

    @PostMapping(value = "/login", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> authenticate(@RequestBody LoginUserDto loginUserDto) {
        try {
            String jwtToken = authenticationService.authenticate(loginUserDto);
            LoginResponse loginResponse = new LoginResponse(jwtToken, jwtService.getExpirationTime());
            return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(loginResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyUser(@RequestBody VerifyUserDto verifyUserDto) {
        try {
            authenticationService.verifyUser(verifyUserDto);
            return ResponseEntity.ok("Account verified successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/resend")
    public ResponseEntity<?> resendVerificationCode(@RequestParam String email) {
        try {
            authenticationService.resendVerificationCode(email);
            return ResponseEntity.ok("Verification code sent");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}