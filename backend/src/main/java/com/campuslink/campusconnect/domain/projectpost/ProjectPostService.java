package com.campuslink.campusconnect.domain.projectpost;

import com.campuslink.campusconnect.domain.projectpost.dto.ProjectPostCreateRequest;
import com.campuslink.campusconnect.domain.projectpost.dto.ProjectPostResponse;
import com.campuslink.campusconnect.domain.projectpost.dto.ProjectPostUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service //해당 클래스가 비즈니스 로직을 처리하는 서비스 계층(Service Layer)의 컴포넌트임을 명시하는 데 사용
@RequiredArgsConstructor // final이 붙은 필드의 생성자를 자동으로 만들어준다. (의존성 주입)

public class ProjectPostService {
    private final ProjectPostRepository projectPostRepository;

    @Transactional // 데이터베이스의 상태를 변경(저장, 수정, 삭제)할 때 붙여줍니다.
    public Long createProjectPost( ProjectPostCreateRequest request) {
        // 1. DTO 데이터를 바탕으로 새로운 ProjectPost 엔티티를 만든다.
        // 주의: ProjectPost 클래스에 @Builder 어노테이션이 없다면, 생성자를 통해 만들어야 한다.
        // ProjectPost projectPost = new ProjectPost();
                 // id는 AUTO_INCREMENT이므로 제외 (보통 빌더나 특정 생성자 사용)
                 // 현재 작성한 ProjectPost 코드 구조상 @AllArgsConstructor만 있으므로,
                 // 아래처럼 객체를 생성하기 위해 ProjectPost 클래스에 빌더 패턴(@Builder)을 추가하는 것이 좋다.

        // 빌더 패턴을 사용한다고 가정했을 때의 예시:

        /*
        ProjectPost projectPost = ProjectPost.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .capacity(request.getCapacity())
                .recruitmentStatus("모집중") // 초기 상태 고정
                .build();
        */
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

    // 조회 로직이므로 (readOnly = true)를 주면 성능이 약간 향상된다.
    @Transactional(readOnly = true)
    public ProjectPostResponse getProjectPost(Long id) {
        // ID로 게시글을 찾고, 없으면 예외를 발생시킨다.
        ProjectPost projectPost = projectPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글을 찾을 수 없습니다. id=" + id));

        // 찾은 엔티티를 통째로 반환하지 않고 DTO로 변환해서 반환한다.
        return new ProjectPostResponse(projectPost);
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
}
