package com.campuslink.campusconnect.domain.projectapplication;

import com.campuslink.campusconnect.domain.projectpost.ProjectPost;
import com.campuslink.campusconnect.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProjectApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_post_id")
    private ProjectPost projectPost;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ★ 프론트엔드 UI에 맞춰 추가된 필드 ★
    @Column(name = "role_name", nullable = false)
    private String roleName; // 지원 역할 (예: 백엔드, 프론트엔드)

    @Column(name = "introduction", length = 1500)
    private String introduction; // 자기소개 및 지원 동기 (UI 최대 1500자 반영)

    @Column(name = "applied_at")
    private LocalDateTime appliedAt;

    // ... 기존 필드들 아래에 추가 ...
    @Column(name = "status", nullable = false)
    private String status = "승인 대기"; // "승인 대기", "승인", "거절"

    public void updateStatus(String status) {
        this.status = status;
    }

    // 생성자 업데이트
    public ProjectApplication(ProjectPost projectPost, User user, String roleName, String introduction) {
        this.projectPost = projectPost;
        this.user = user;
        this.roleName = roleName;
        this.introduction = introduction;
        this.appliedAt = LocalDateTime.now();
    }
}