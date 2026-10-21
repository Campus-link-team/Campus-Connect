package com.campuslink.campusconnect.domain.projectapplication;

import com.campuslink.campusconnect.domain.projectpost.ProjectPost;
import com.campuslink.campusconnect.domain.projectpost.ProjectPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectApplicationService {

    private final ProjectPostRepository projectPostRepository;
    private final ProjectApplicationRepository projectApplicationRepository;

    @Transactional
    public void applyToProject(Long postId, Long userId) {
        // 1. 자물쇠가 걸린 상태로 게시글을 조회
        ProjectPost post = projectPostRepository.findByIdWithPessimisticLock(postId)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글을 찾을 수 없습니다. id=" + postId));

        // 2. 중복 지원 검증 로직 추가
        if (projectApplicationRepository.existsByProjectPostAndUserId(post, userId)) {
            throw new IllegalStateException("이미 지원한 게시글입니다.");
        }

        // 3. 게시글의 지원자 수를 늘리고 정원 마감 처리
        post.apply();

        // 4. 지원 내역을 DB에 저장
        ProjectApplication application = new ProjectApplication(post, userId);
        projectApplicationRepository.save(application);
    }
}
