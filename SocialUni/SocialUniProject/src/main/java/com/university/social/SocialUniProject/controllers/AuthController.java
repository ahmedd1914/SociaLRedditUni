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

@RestController
@RequestMapping("/auth")
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
        return ResponseEntity.ok(jwtToken);
    }

    @PostMapping(value = "/login", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<LoginResponse> authenticate(@RequestBody LoginUserDto loginUserDto) {
        String jwtToken = authenticationService.authenticate(loginUserDto);
        LoginResponse loginResponse = new LoginResponse(jwtToken, jwtService.getExpirationTime());
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyUser(@RequestBody VerifyUserDto verifyUserDto) {
        authenticationService.verifyUser(verifyUserDto);
        return ResponseEntity.ok("Account verified successfully");
    }

    @PostMapping("/resend")
    public ResponseEntity<String> resendVerificationCode(@RequestParam String email) {
        authenticationService.resendVerificationCode(email);
        return ResponseEntity.ok("Verification code sent");
    }
}
