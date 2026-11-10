package com.campuslink.campusconnect.domain.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // 이메일로 회원 정보 찾기 (로그인 및 중복 가입 검증 시 사용)
    Optional<User> findByEmail(String email);

    // 이미 가입된 이메일인지 확인
    boolean existsByEmail(String email);
}