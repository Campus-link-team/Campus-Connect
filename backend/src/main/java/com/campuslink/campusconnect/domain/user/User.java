package com.campuslink.campusconnect.domain.user;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "users") // MySQL 예약어와의 충돌을 방지하기 위해 테이블명을 users로 지정합니다.
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email; // 학교 이메일 (아이디)

    @Column(nullable = false)
    private String password; // 비밀번호

    @Column(nullable = false)
    private String name; // 사용자 이름

    private String nickname; // 닉네임

    private String department; // 학과

    @Builder
    public User(String email, String password, String name, String nickname, String department) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.nickname = nickname;
        this.department = department;
    }
}