package com.campuslink.campusconnect.domain.projectpost;

import com.campuslink.campusconnect.domain.projectpost.dto.*;
import com.campuslink.campusconnect.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects") // 프론트엔드 명세서에 맞춘 공통 경로
@RequiredArgsConstructor
public class ProjectPostController {

    private final ProjectPostService projectPostService;

    // 1. 단건 상세 조회 (기존 getProjectPost 활용 + ApiResponse 포장)
    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectPostResponse>> getProjectDetail(@PathVariable Long projectId) {
        ProjectPostResponse response = projectPostService.getProjectPost(projectId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 2. 모집글 작성 (기존 createPost 활용 + userId 쿼리 파라미터 유지)
    @PostMapping
    public ResponseEntity<ApiResponse<String>> createProject(
            @RequestBody ProjectPostDto requestDto,
            @RequestParam Long userId) {
        projectPostService.createPost(requestDto, userId);
        return ResponseEntity.status(201).body(ApiResponse.success("게시글이 성공적으로 생성되었습니다."));
    }

    // 3. 모집글 수정 (기존 updateProjectPost 활용 + 프론트 명세서에 맞춰 PatchMapping)
    @PatchMapping("/{projectId}")
    public ResponseEntity<ApiResponse<Long>> updateProject(
            @PathVariable Long projectId,
            @RequestBody ProjectPostUpdateRequest request) {
        Long updatedId = projectPostService.updateProjectPost(projectId, request);
        return ResponseEntity.ok(ApiResponse.success(updatedId));
    }

    // 4. 모집글 삭제 (기존 deleteProjectPost 활용)
    @DeleteMapping("/{projectId}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long projectId) {
        projectPostService.deleteProjectPost(projectId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // =========================================================================
    // [주의] 아래 두 기능은 아직 Service 로직과 DTO가 없어서 주석 처리해 두었습니다.
    // 에러 없이 서버가 켜지는 것을 확인한 후, 다음 스텝에서 채워 넣을 예정입니다!
    // =========================================================================


    // 5. 프로젝트 목록 조회 (분야, 역할 필터링 등)
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectPostResponse>>> getProjects(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String sort) {
        List<ProjectPostResponse> projectList = projectPostService.getProjects(category, role, sort);
        return ResponseEntity.ok(ApiResponse.success(projectList));
    }

    // 6. 프로젝트 지원하기
    @PostMapping("/{projectId}/applications")
    public ResponseEntity<ApiResponse<Void>> applyProject(
            @PathVariable Long projectId,
            @RequestBody ApplicationRequest request) { // ApplicationRequest DTO 추후 생성
        projectPostService.applyProject(projectId, request);
        return ResponseEntity.status(201).body(ApiResponse.success(null));
    }

    // 7. 지원자 승인/거절 처리
    @PatchMapping("/{projectId}/applications/{applicationId}")
    public ResponseEntity<ApiResponse<Void>> updateApplicationStatus(
            @PathVariable Long projectId,
            @PathVariable Long applicationId,
            @RequestBody ApplicationStatusRequest request) {
        projectPostService.updateApplicationStatus(applicationId, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}