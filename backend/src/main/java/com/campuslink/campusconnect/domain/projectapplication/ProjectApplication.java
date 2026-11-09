package com.campuslink.campusconnect.domain.projectapplication;

import com.campuslink.campusconnect.domain.projectpost.ProjectPost;
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

    // 지원한 게시글 (다대일 관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_post_id")
    private ProjectPost projectPost;

    // 지원한 사용자 ID (나중에 User 엔티티와 연결 예정)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "applied_at")
    private LocalDateTime appliedAt;

    // 생성자
    public ProjectApplication(ProjectPost projectPost, Long userId) {
        this.projectPost = projectPost;
        this.userId = userId;
        this.appliedAt = LocalDateTime.now(); // 지원한 현재 시간 자동 저장
    }
}