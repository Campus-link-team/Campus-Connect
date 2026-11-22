package com.campuslink.campusconnect.domain.projectapplication;

import com.campuslink.campusconnect.domain.projectpost.ProjectPost;
import com.campuslink.campusconnect.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProjectApplicationRepository extends JpaRepository<ProjectApplication, Long> {

    // 1. 특정 회원이 특정 게시글에 이미 지원했는지 확인하는 메서드 (중복 지원 방지용)
    // 수정 전: existsByProjectPostAndUserId
    // 수정 후: existsByProjectPostAndUser
    boolean existsByProjectPostAndUser(ProjectPost projectPost, User user);

    // 2. 특정 게시글에 지원한 모든 내역을 가져오는 메서드 (나중에 지원자 목록 볼 때 사용)
    List<ProjectApplication> findAllByProjectPost(ProjectPost projectPost);

    List<ProjectApplication> findAllByProjectPostAndStatus(ProjectPost projectPost, String status);

    // 3. 특정 회원이 지원한 모든 내역을 가져오는 메서드 (마이페이지에서 내 지원 내역 볼 때 사용)
    List<ProjectApplication> findAllByUserId(Long userId);

    // 특정 회원이 지원한 총 횟수 계산
    int countByUser(User user);

    // 내 지원 내역 + 모집글 (최신순, 마이페이지)
    @Query("select a from ProjectApplication a join fetch a.projectPost where a.user.id = :userId order by a.appliedAt desc, a.id desc")
    List<ProjectApplication> findMineWithPost(@Param("userId") Long userId);
}
