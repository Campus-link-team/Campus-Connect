package com.campuslink.campusconnect.domain.auth;

import com.campuslink.campusconnect.domain.auth.dto.EmailSendResponse;
import com.campuslink.campusconnect.domain.auth.dto.EmailVerifyResponse;
import com.campuslink.campusconnect.domain.user.UserRepository;
import com.campuslink.campusconnect.global.exception.BusinessException;
import com.campuslink.campusconnect.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

// 학교 이메일 인증 (3.2). 요구사항 FR-002에 따라 실제 메일은 보내지 않는 Mock 방식이다.
// 인증 코드는 서버 로그와 send-code 응답의 mockCode로 확인한다.
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmailVerificationService {

    private static final long CODE_TTL_SECONDS = 300; // 5분
    private static final SecureRandom RANDOM = new SecureRandom();

    private final EmailVerificationRepository emailVerificationRepository;
    private final UserRepository userRepository;

    @Value("${campus.email.allowed-domain:syu.ac.kr}")
    private String allowedDomain;

    @Transactional
    public EmailSendResponse sendCode(String rawEmail) {
        String email = normalize(rawEmail);
        validateSchoolEmail(email);
        if (userRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        emailVerificationRepository.save(
                new EmailVerification(email, code, LocalDateTime.now().plusSeconds(CODE_TTL_SECONDS)));

        log.info("[Mock 이메일 인증] {} 인증 코드: {}", email, code);
        return new EmailSendResponse(CODE_TTL_SECONDS, code);
    }

    @Transactional
    public EmailVerifyResponse verify(String rawEmail, String code) {
        String email = normalize(rawEmail);
        EmailVerification verification = emailVerificationRepository.findTopByEmailOrderByIdDesc(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.VERIFICATION_NOT_REQUESTED));

        if (verification.isExpired(LocalDateTime.now())) {
            throw new BusinessException(ErrorCode.VERIFICATION_CODE_EXPIRED);
        }
        if (!verification.matches(code.trim())) {
            throw new BusinessException(ErrorCode.VERIFICATION_CODE_MISMATCH);
        }

        verification.markVerified();
        return new EmailVerifyResponse(true);
    }

    // 학교 도메인(@syu.ac.kr) 이메일인지 확인
    public void validateSchoolEmail(String email) {
        if (!normalize(email).endsWith("@" + allowedDomain.toLowerCase())) {
            throw new BusinessException(ErrorCode.INVALID_SCHOOL_EMAIL);
        }
    }

    public boolean isVerified(String email) {
        return emailVerificationRepository.existsByEmailAndVerifiedTrue(normalize(email));
    }

    private String normalize(String email) {
        return email.trim().toLowerCase();
    }
}
