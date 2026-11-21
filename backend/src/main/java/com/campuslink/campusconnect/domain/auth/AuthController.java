package com.campuslink.campusconnect.domain.auth;

import com.campuslink.campusconnect.domain.auth.dto.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final EmailVerificationService emailVerificationService;

    // POST /api/v1/auth/signup
    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public SignupResponse signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    // POST /api/v1/auth/login
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    // POST /api/v1/auth/email/send-code  (Mock: 실제 메일 대신 응답의 mockCode와 서버 로그로 확인)
    @PostMapping("/email/send-code")
    public EmailSendResponse sendCode(@Valid @RequestBody EmailSendRequest request) {
        return emailVerificationService.sendCode(request.email());
    }

    // POST /api/v1/auth/email/verify
    @PostMapping("/email/verify")
    public EmailVerifyResponse verifyEmail(@Valid @RequestBody EmailVerifyRequest request) {
        return emailVerificationService.verify(request.email(), request.code());
    }

    // GET /api/v1/auth/nickname/check?nickname=홍길동
    @GetMapping("/nickname/check")
    public NicknameCheckResponse checkNickname(
            @RequestParam @Size(min = 2, max = 15, message = "닉네임은 2~15자여야 합니다.") String nickname) {
        return authService.checkNickname(nickname);
    }
}
