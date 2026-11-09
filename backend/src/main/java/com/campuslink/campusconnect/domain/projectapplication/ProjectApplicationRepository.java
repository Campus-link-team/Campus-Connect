package com.campuslink.campusconnect.domain.projectapplication;

import com.campuslink.campusconnect.domain.projectpost.ProjectPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectApplicationRepository extends JpaRepository<ProjectApplication, Long> {

    // 1. 특정 회원이 특정 게시글에 이미 지원했는지 확인하는 메서드 (중복 지원 방지용)
    boolean existsByProjectPostAndUserId(ProjectPost projectPost, Long userId);

    // 2. 특정 게시글에 지원한 모든 내역을 가져오는 메서드 (나중에 지원자 목록 볼 때 사용)
    List<ProjectApplication> findAllByProjectPost(ProjectPost projectPost);

    // 3. 특정 회원이 지원한 모든 내역을 가져오는 메서드 (마이페이지에서 내 지원 내역 볼 때 사용)
    List<ProjectApplication> findAllByUserId(Long userId);
}