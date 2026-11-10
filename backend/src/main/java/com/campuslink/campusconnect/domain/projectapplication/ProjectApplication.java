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

    // 지원한 게시글 (다대일 관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_post_id")
    private ProjectPost projectPost;

    // 지원한 사용자 ID (나중에 User 엔티티와 연결 예정)
    //@Column(name = "user_id")
    //private Long userId;

    // 기존: private Long userId;
    // 변경: 지원한 사용자 (N:1 연관관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "applied_at")
    private LocalDateTime appliedAt;

    // 생성자
    public ProjectApplication(ProjectPost projectPost, User user) {
        this.projectPost = projectPost;
        this.user = user;
        this.appliedAt = LocalDateTime.now();
    }
}