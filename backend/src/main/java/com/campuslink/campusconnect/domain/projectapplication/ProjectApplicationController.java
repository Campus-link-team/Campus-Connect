package com.campuslink.campusconnect.domain.projectapplication;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectApplicationController {

    private final ProjectApplicationService projectApplicationService;

    // POST /api/projects/{postId}/apply?userId={userId}
    @PostMapping("/{postId}/apply")
    public ResponseEntity<String> apply(@PathVariable Long postId, @RequestParam Long userId) {

        // 서비스의 지원 로직 실행
        projectApplicationService.applyToProject(postId, userId);

        // 성공 시 메시지 반환
        return ResponseEntity.ok("지원이 성공적으로 완료되었습니다.");
    }
}