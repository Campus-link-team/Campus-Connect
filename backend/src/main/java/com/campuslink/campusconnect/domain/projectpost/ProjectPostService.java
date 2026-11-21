package com.campuslink.campusconnect.domain.projectpost;

import com.campuslink.campusconnect.domain.projectapplication.ProjectApplication;
import com.campuslink.campusconnect.domain.projectapplication.ProjectApplicationRepository;
import com.campuslink.campusconnect.domain.projectpost.dto.*;
import com.campuslink.campusconnect.domain.user.User;
import com.campuslink.campusconnect.domain.user.UserRepository;
import com.campuslink.campusconnect.global.exception.BusinessException;
import com.campuslink.campusconnect.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service //해당 클래스가 비즈니스 로직을 처리하는 서비스 계층(Service Layer)의 컴포넌트임을 명시하는 데 사용
@RequiredArgsConstructor // final이 붙은 필드의 생성자를 자동으로 만들어준다. (의존성 주입)

public class ProjectPostService {
    private final ProjectPostRepository projectPostRepository;
    // 1. 유저를 찾기 위해 UserRepository를 주입받습니다.
    private final ProjectApplicationRepository projectApplicationRepository;
    private final UserRepository userRepository;

    @Transactional // 데이터베이스의 상태를 변경(저장, 수정, 삭제)할 때 붙여줍니다.
    public void createPost(ProjectPostDto requestDto, Long userId) {
        // 2. 컨트롤러에서 넘겨받은 userId로 DB에서 작성자(User)를 조회합니다.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저를 찾을 수 없습니다. id=" + userId));

        // 3. ProjectPost 객체를 생성할 때 조회해 온 user를 함께 넘겨줍니다.
        ProjectPost post = new ProjectPost(
                requestDto.getTitle(),
                requestDto.getContent(),
                requestDto.getCapacity(),
                requestDto.getCategory(),
                requestDto.getLocation(),
                user // ★ 변경된 부분
        );

        // 4. DB에 저장
        projectPostRepository.save(post);
    }
    /*
    public Long createProjectPost( ProjectPostCreateRequest request) {
        // 1. DTO 데이터를 바탕으로 새로운 ProjectPost 엔티티를 만든다.
        // 주의: ProjectPost 클래스에 @Builder 어노테이션이 없다면, 생성자를 통해 만들어야 한다.
        // ProjectPost projectPost = new ProjectPost();
                 // id는 AUTO_INCREMENT이므로 제외 (보통 빌더나 특정 생성자 사용)
                 // 현재 작성한 ProjectPost 코드 구조상 @AllArgsConstructor만 있으므로,
                 // 아래처럼 객체를 생성하기 위해 ProjectPost 클래스에 빌더 패턴(@Builder)을 추가하는 것이 좋다.

        // 빌더 패턴을 사용한다고 가정했을 때의 예시:


        ProjectPost projectPost = ProjectPost.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .capacity(request.getCapacity())
                .recruitmentStatus("모집중") // 초기 상태 고정
                .build();

        ProjectPost projectPost = ProjectPost.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .capacity(request.getCapacity())
                .recruitmentStatus("모집중") // 초기 상태 고정
                .currentApplicantCount(0) //초기 상태 고정
                .category(request.getCategory())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .location(request.getLocation())
                .qualifications(request.getQualifications())
                .tags(request.getTags())
                .build();

        // 2. Repository를 통해 DB에 저장한다.
        ProjectPost savedPost = projectPostRepository.save(projectPost);

        // 3. 생성된 게시글의 ID를 반환한다.
        return savedPost.getId();
    }
    */
    // 조회 로직이므로 (readOnly = true)를 주면 성능이 약간 향상된다.
    @Transactional(readOnly = true)
    public ProjectPostResponse getProjectPost(Long id) {
        // ID로 게시글을 찾고, 없으면 예외를 발생시킨다.
        ProjectPost projectPost = projectPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글을 찾을 수 없습니다. id=" + id));
// 4개의 데이터를 상자(DTO) 규격에 맞춰서 담아 반환합니다.
        return ProjectPostResponse.from(projectPost);
    }

    @Transactional
    public Long updateProjectPost(Long id, Long userId, ProjectPostUpdateRequest request) {
        ProjectPost projectPost = projectPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다. id=" + id));
        validateWriter(projectPost, userId, "모집글 작성자만 수정할 수 있습니다.");

        projectPost.updatePost(
                request.getTitle(),
                request.getContent(),
                request.getCapacity(),
                request.getCategory(),
                request.getLocation()
        );

        return projectPost.getId();
    }

    @Transactional
    public void deleteProjectPost(Long id, Long userId) {
        ProjectPost projectPost = projectPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다. id=" + id));
        validateWriter(projectPost, userId, "모집글 작성자만 삭제할 수 있습니다.");
        projectPostRepository.delete(projectPost);
    }
    // 프로젝트 목록 조회 (category, status 필터 대응)
    @Transactional(readOnly = true)
    public List<ProjectPostResponse> getProjects(String category, String role, String sort, String status) {
        if (status != null && !status.isBlank()
                && !"RECRUITING".equalsIgnoreCase(status)
                && !"CLOSED".equalsIgnoreCase(status)) {
            throw new IllegalArgumentException("유효하지 않은 모집 상태 필터입니다: " + status);
        }

        List<ProjectPost> posts = projectPostRepository.findAll();

        return posts.stream()
                .filter(post -> category == null || category.isBlank()
                        || (post.getCategory() != null && post.getCategory().equalsIgnoreCase(category)))
                .filter(post -> status == null || status.isBlank()
                        || status.equalsIgnoreCase(post.getRecruitmentStatus()))
                .map(ProjectPostResponse::from)
                .toList();
    }

    // 2. 프로젝트 지원하기 (DB 연동 완성)
    @Transactional
    public void applyProject(Long projectId, Long userId, ApplicationRequest request) {
        // 1) 지원하려는 프로젝트 게시글을 DB에서 찾습니다.
        ProjectPost projectPost = projectPostRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("해당 프로젝트를 찾을 수 없습니다. id=" + projectId));

        if ("CLOSED".equals(projectPost.getRecruitmentStatus())) {
            throw new IllegalStateException("모집이 마감된 프로젝트에는 지원할 수 없습니다.");
        }

        // 2) 현재 로그인한 사용자 정보를 가져옵니다.
        // (현재는 테스트를 위해 임의의 2번 유저를 하드코딩합니다. 추후 시큐리티 연동 필요)
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. id=" + userId));

        if (projectPost.getUser() != null && projectPost.getUser().getId().equals(userId)) {
            throw new IllegalStateException("본인이 작성한 모집글에는 지원할 수 없습니다.");
        }

        // 3) 중복 지원 방지 검증 (Repository에 만들어둔 메서드 활용!)
        if (projectApplicationRepository.existsByProjectPostAndUser(projectPost, currentUser)) {
            throw new IllegalStateException("이미 지원한 프로젝트입니다.");
        }

        // 4) 지원서(ProjectApplication) 엔티티를 생성하고 DB에 저장합니다.
        ProjectApplication application = new ProjectApplication(
                projectPost,
                currentUser,
                request.getRoleName(),
                request.getIntroduction()
        );

        projectApplicationRepository.save(application);
    }

    // 3. 지원자 승인/거절 처리 (작성자만 가능, 이미 처리된 지원 재처리 불가)
    @Transactional
    public void updateApplicationStatus(Long projectId, Long applicationId, Long userId, ApplicationStatusRequest request) {
        ProjectApplication application = projectApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("지원 내역을 찾을 수 없습니다. id=" + applicationId));

        ProjectPost post = application.getProjectPost();
        if (!post.getId().equals(projectId)) {
            throw new IllegalArgumentException("해당 모집글의 지원 내역이 아닙니다.");
        }

        // 1. 모집글 작성자 본인 검증
        validateWriter(post, userId, "모집글 작성자만 지원을 승인하거나 거절할 수 있습니다.");

        // 2. 이미 처리된 지원 재처리 방지
        if (!"PENDING".equals(application.getStatus())) {
            throw new IllegalStateException("이미 처리된 지원 내역입니다.");
        }

        // 3. 상태값 검증 (APPROVED / REJECTED)
        String newStatus = request.getStatus();
        if (!"APPROVED".equals(newStatus) && !"REJECTED".equals(newStatus)) {
            throw new IllegalArgumentException("유효하지 않은 지원 상태값입니다: " + newStatus);
        }

        application.updateStatus(newStatus);

        // 4. APPROVED인 경우 정원 체크 및 현재 인원수 증가
        if ("APPROVED".equals(newStatus)) {
            ProjectPost lockedPost = projectPostRepository.findByIdWithPessimisticLock(projectId)
                    .orElseThrow(() -> new IllegalArgumentException("해당 게시글을 찾을 수 없습니다. id=" + projectId));
            lockedPost.apply();

            // 정원이 다 차서 마감된 경우, 남은 PENDING 지원 자동 거절
            if ("CLOSED".equals(lockedPost.getRecruitmentStatus())) {
                rejectRemainingPendingApplications(lockedPost);
        }
    }
}

    // 5 & 6. 모집 직접 마감 + 남은 PENDING 지원 자동 거절 (작성자만 가능)
    @Transactional
    public void closeProject(Long projectId, Long userId) {
        ProjectPost post = projectPostRepository.findByIdWithPessimisticLock(projectId)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글을 찾을 수 없습니다. id=" + projectId));

        validateWriter(post, userId, "모집글 작성자만 마감할 수 있습니다.");

        post.close();
        rejectRemainingPendingApplications(post);
    }

    // 7. 지원 취소 (본인 & PENDING 상태일 때만 가능)
    @Transactional
    public void cancelApplication(Long projectId, Long applicationId, Long userId) {
        ProjectApplication application = projectApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("지원 내역을 찾을 수 없습니다. id=" + applicationId));

        if (!application.getProjectPost().getId().equals(projectId)) {
            throw new IllegalArgumentException("해당 모집글의 지원 내역이 아닙니다.");
        }

        if (application.getUser() == null || !application.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "본인의 지원 내역만 취소할 수 있습니다.");
        }

        if (!"PENDING".equals(application.getStatus())) {
            throw new IllegalStateException("대기 중인(PENDING) 지원만 취소할 수 있습니다.");
        }

        projectApplicationRepository.delete(application);
    }

    // 지원자 목록 조회 (모집글 작성자만)
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplications(Long projectId, Long userId) {
        ProjectPost post = projectPostRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글을 찾을 수 없습니다. id=" + projectId));
        validateWriter(post, userId, "모집글 작성자만 지원자 목록을 볼 수 있습니다.");

        return projectApplicationRepository.findAllByProjectPost(post).stream()
                .map(ApplicationResponse::from)
                .toList();
    }

    // 모집글 작성자 본인인지 확인 (아니면 403)
    private void validateWriter(ProjectPost post, Long userId, String message) {
        if (post.getUser() == null || !post.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, message);
        }
    }

    private void rejectRemainingPendingApplications(ProjectPost post) {
        List<ProjectApplication> pendingApplications =
                projectApplicationRepository.findAllByProjectPostAndStatus(post, "PENDING");
        for (ProjectApplication pending : pendingApplications) {
            pending.updateStatus("REJECTED");
        }
    }
}
