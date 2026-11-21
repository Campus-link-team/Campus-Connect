package com.campuslink.campusconnect.domain.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {

    // 가장 최근에 요청한 인증 코드
    Optional<EmailVerification> findTopByEmailOrderByIdDesc(String email);

    // 인증을 마친 기록이 있는지 (회원가입 시 확인)
    boolean existsByEmailAndVerifiedTrue(String email);
}
