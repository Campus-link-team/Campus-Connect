package com.campuslink.campusconnect.domain.projectapplication;

import com.campuslink.campusconnect.domain.projectpost.ProjectPost;
import com.campuslink.campusconnect.domain.projectpost.ProjectPostRepository;
import com.campuslink.campusconnect.domain.user.User;
import com.campuslink.campusconnect.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectApplicationService {

    private final ProjectPostRepository projectPostRepository;
    private final ProjectApplicationRepository projectApplicationRepository;
    // 1. 유저를 찾기 위해 UserRepository를 추가로 주입받습니다.
    private final UserRepository userRepository;

    @Transactional
    public void applyToProject(Long postId, Long userId) {
        // 1. 자물쇠가 걸린 상태로 게시글 조회
        ProjectPost post = projectPostRepository.findByIdWithPessimisticLock(postId)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글을 찾을 수 없습니다. id=" + postId));

        // 2. 전달받은 userId로 User 객체를 DB에서 조회합니다. (새로 추가된 부분)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저를 찾을 수 없습니다. id=" + userId));

        // 3. 중복 지원 검증 로직 (이제 userId 대신 user 객체를 넘깁니다)
        if (projectApplicationRepository.existsByProjectPostAndUser(post, user)) {
            throw new IllegalStateException("이미 지원한 게시글입니다.");
        }

        // 4. 게시글의 지원자 수를 늘리고 정원 마감 처리
        post.apply();

        // 5. 지원 내역 DB 저장 (userId 대신 조회해 온 user 객체를 넣습니다)
        // 주의: 이 서비스는 옛날 방식이므로 임시로 빈 문자열을 넣습니다.
        ProjectApplication application = new ProjectApplication(post, user, "역할 미지정", "동기 없음");
        projectApplicationRepository.save(application);
    }
}