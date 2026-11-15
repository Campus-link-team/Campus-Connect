package com.campuslink.campusconnect.domain.projectpost;

import com.campuslink.campusconnect.domain.projectapplication.ProjectApplication;
import com.campuslink.campusconnect.domain.projectapplication.ProjectApplicationRepository;
import com.campuslink.campusconnect.domain.projectpost.dto.*;
import com.campuslink.campusconnect.domain.user.User;
import com.campuslink.campusconnect.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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
        return new ProjectPostResponse(
                projectPost.getId(),
                projectPost.getTitle(),
                projectPost.getUser(),
                projectPost.getStartDate() != null ? projectPost.getStartDate().toString() : "미정"
        );
    }

    @Transactional
    public Long updateProjectPost(Long id, ProjectPostUpdateRequest request) {
        ProjectPost projectPost = projectPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다. id=" + id));

        // 엔티티의 값을 변경하면, @Transactional에 의해 메서드가 끝날 때 DB에 자동으로 반영(Update)됩니다. (Dirty Checking)
        projectPost.updatePost(request.getTitle(), request.getContent(), request.getCapacity(), request.getCategory(), request.getLocation());

        return projectPost.getId();
    }

    @Transactional
    public void deleteProjectPost(Long id) {
        ProjectPost projectPost = projectPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다. id=" + id));
        projectPostRepository.delete(projectPost);
    }
    // 1. 프로젝트 목록 조회 (프론트 필터링 대응)
    @Transactional(readOnly = true)
    public List<ProjectPostResponse> getProjects(String category, String role, String sort) {
        // 실제로는 Repository에서 category, role 등의 조건에 맞는 데이터를
        // 쿼리(QueryDSL 등)로 가져와야 하지만, 현재는 테스트를 위해 전체 목록을 반환합니다.
        // 프론트엔드 연동 테스트를 위해 데이터가 넘어가는지 확인하는 용도입니다.
        List<ProjectPost> posts = projectPostRepository.findAll();

        return posts.stream()
                .map(post -> new ProjectPostResponse(
                        post.getId(),
                        post.getTitle(),
                        post.getUser(),
                        post.getStartDate().toString()))
                .toList();
    }

    // 2. 프로젝트 지원하기 (DB 연동 완성)
    @Transactional
    public void applyProject(Long projectId, ApplicationRequest request) {
        // 1) 지원하려는 프로젝트 게시글을 DB에서 찾습니다.
        ProjectPost projectPost = projectPostRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("해당 프로젝트를 찾을 수 없습니다. id=" + projectId));

        // 2) 현재 로그인한 사용자 정보를 가져옵니다.
        // (현재는 테스트를 위해 임의의 2번 유저를 하드코딩합니다. 추후 시큐리티 연동 필요)
        User currentUser = userRepository.findById(2L)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 3) 중복 지원 방지 검증 (Repository에 만들어둔 메서드 활용!)
        if (projectApplicationRepository.existsByProjectPostAndUser(projectPost, currentUser)) {
            throw new IllegalStateException("이미 지원한 프로젝트입니다.");
        }

        // 4) 지원서(ProjectApplication) 엔티티를 생성하고 DB에 저장합니다.
        ProjectApplication application = new ProjectApplication(
                projectPost,
                currentUser,
                request.getRoleName(),      // 추가됨!
                request.getIntroduction()   // 추가됨!
        );

        projectApplicationRepository.save(application);
    }
    // 3. 지원자 승인/거절 처리
    @Transactional
    public void updateApplicationStatus(Long applicationId, ApplicationStatusRequest request) {
        ProjectApplication application = projectApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("지원 내역을 찾을 수 없습니다."));

        // 프론트에서 넘어온 상태("승인" 또는 "거절")로 업데이트
        application.updateStatus(request.getStatus());

        // '승인' 처리인 경우, 게시글의 현재 인원수를 1명 늘리고 정원 체크
        if ("승인".equals(request.getStatus())) {
            ProjectPost post = application.getProjectPost();
            post.apply();
        }
    }
}