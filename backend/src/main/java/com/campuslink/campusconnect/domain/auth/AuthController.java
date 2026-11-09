package com.campuslink.campusconnect.domain.auth;

import com.campuslink.campusconnect.domain.auth.dto.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/signup
    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public SignupResponse signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    // GET /api/auth/nickname/check?nickname=홍길동
    @GetMapping("/nickname/check")
    public NicknameCheckResponse checkNickname(
            @RequestParam @Size(min = 2, max = 15, message = "닉네임은 2~15자여야 합니다.") String nickname) {
        return authService.checkNickname(nickname);
    }
}
