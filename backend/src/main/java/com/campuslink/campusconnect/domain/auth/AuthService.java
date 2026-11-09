package com.campuslink.campusconnect.domain.auth;

import com.campuslink.campusconnect.domain.auth.dto.*;
import com.campuslink.campusconnect.domain.user.User;
import com.campuslink.campusconnect.domain.user.UserRepository;
import com.campuslink.campusconnect.global.exception.BusinessException;
import com.campuslink.campusconnect.global.exception.ErrorCode;
import com.campuslink.campusconnect.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // TODO(3.2): 학교 이메일 인증을 마친 이메일만 가입 가능하도록 EMAIL_NOT_VERIFIED 검사 추가
    @Transactional
    public SignupResponse signup(SignupRequest request) {
        String email = request.email().trim().toLowerCase();
        String nickname = request.nickname().trim();

        if (userRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        if (userRepository.existsByNickname(nickname)) {
            throw new BusinessException(ErrorCode.NICKNAME_ALREADY_EXISTS);
        }

        User user = new User(email, passwordEncoder.encode(request.password()), nickname);
        return SignupResponse.from(userRepository.save(user));
    }

    public LoginResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        // 보안상 "없는 이메일"과 "틀린 비밀번호"를 같은 에러로 응답
        User user = userRepository.findByEmail(email)
                .filter(u -> passwordEncoder.matches(request.password(), u.getPassword()))
                .orElseThrow(() -> new BusinessException(ErrorCode.LOGIN_FAILED));

        String token = jwtTokenProvider.createAccessToken(user);
        return LoginResponse.bearer(token, jwtTokenProvider.getExpirationSeconds());
    }

    public NicknameCheckResponse checkNickname(String nickname) {
        return new NicknameCheckResponse(!userRepository.existsByNickname(nickname.trim()));
    }
}
