package com.university.social.SocialUniProject.controllers;

import com.university.social.SocialUniProject.dto.UserDto.LoginUserDto;
import com.university.social.SocialUniProject.dto.UserDto.RegisterUserDto;
import com.university.social.SocialUniProject.dto.UserDto.TokenBlacklistService;
import com.university.social.SocialUniProject.dto.UserDto.VerifyUserDto;
import com.university.social.SocialUniProject.responses.LoginResponse;
import com.university.social.SocialUniProject.services.UserServices.AuthenticationService;
import com.university.social.SocialUniProject.services.UserServices.JwtService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final JwtService jwtService;
    private final AuthenticationService authenticationService;
    private final TokenBlacklistService tokenBlacklistService;

    public AuthController(JwtService jwtService, AuthenticationService authenticationService, TokenBlacklistService tokenBlacklistService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @PostMapping("/signup")
    public ResponseEntity<String> register(@RequestBody RegisterUserDto registerUserDto) {
        String jwtToken = authenticationService.signup(registerUserDto);
        return ResponseEntity.ok(jwtToken);
    }

    @PostMapping(value = "/login", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<LoginResponse> authenticate(@RequestBody LoginUserDto loginUserDto) {
        String jwtToken = authenticationService.authenticate(loginUserDto);
        LoginResponse loginResponse = new LoginResponse(jwtToken, jwtService.getExpirationTime());
        System.out.println("Sending response to frontend: " + loginResponse);
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyUser(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody VerifyUserDto verifyUserDto
    ) {
        String jwt = authHeader.replace("Bearer ", "");
        authenticationService.verifyUserByJwt(jwt, verifyUserDto.getVerificationCode());
        return ResponseEntity.ok("Account verified successfully");
    }

    @PostMapping("/resend")
    public ResponseEntity<String> resendVerificationCode(@RequestParam String email) {
        authenticationService.resendVerificationCode(email);
        return ResponseEntity.ok("Verification code sent");
    }
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String authHeader) {

        String jwt = authHeader.replace("Bearer ", "");
        tokenBlacklistService.blacklistToken(jwt);
        return ResponseEntity.ok("Logged out successfully");
    }
}
