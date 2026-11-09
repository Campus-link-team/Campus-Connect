package com.campuslink.campusconnect.domain.projectpost;

import com.campuslink.campusconnect.domain.projectpost.dto.ProjectPostCreateRequest;
import com.campuslink.campusconnect.domain.projectpost.dto.ProjectPostResponse;
import com.campuslink.campusconnect.domain.projectpost.dto.ProjectPostUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController //HTTP 요청을 받아 뷰(HTML 등) 대신 객체나 데이터(JSON, XML 등)를 직접 HTTP 응답 본문(Response Body)에 반환하는 특수 컨트롤러 어노테이션
@RequestMapping("/api/projects") // 이 컨트롤러의 기본 URL 경로, 아직 모름
@RequiredArgsConstructor //final이나 @NonNull이 붙은 필드를 매개변수로 갖는 생성자를 자동으로 생성해줌.

public class ProjectPostController {
    private final ProjectPostService projectPostService;

    // POST /api/projects 요청이 오면 이 메서드가 실행됨.
    @PostMapping
    public ResponseEntity<Long> createPost(@RequestBody ProjectPostCreateRequest request) {
        // 서비스의 로직을 호출하여 게시글을 생성하고, 생성된 ID를 받음.
        Long postId = projectPostService.createProjectPost(request);

        // 성공적으로 생성되었다는 응답(200 OK)과 함께 ID를 반환합니다.
        return ResponseEntity.ok(postId);
    }
    // GET /api/projects/{id} 요청이 오면 이 메서드가 실행됩니다.
    @GetMapping("/{id}")
    public ResponseEntity<ProjectPostResponse> getPost(@PathVariable Long id) {
        ProjectPostResponse response = projectPostService.getProjectPost(id);
        return ResponseEntity.ok(response);
    }
    // 수정 (Update)
    @PutMapping("/{id}")
    public ResponseEntity<Long> updatePost(@PathVariable Long id, @RequestBody ProjectPostUpdateRequest request) {
        Long updatedId = projectPostService.updateProjectPost(id, request);
        return ResponseEntity.ok(updatedId);
    }
    // 삭제 (Delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        projectPostService.deleteProjectPost(id);
        return ResponseEntity.ok().build();
    }
}
