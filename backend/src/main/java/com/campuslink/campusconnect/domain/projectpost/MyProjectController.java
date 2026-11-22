package com.campuslink.campusconnect.domain.projectpost;

import com.campuslink.campusconnect.domain.projectpost.dto.MyApplicationResponse;
import com.campuslink.campusconnect.domain.projectpost.dto.ProjectPostResponse;
import com.campuslink.campusconnect.global.common.ApiResponse;
import com.campuslink.campusconnect.global.security.LoginUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// 마이페이지의 프로젝트 모집 부분. 다른 마이페이지 목록과 충돌하지 않도록 UserController 대신 따로 둔다.
@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
public class MyProjectController {

    private final ProjectPostService projectPostService;

    // GET /api/v1/users/me/projects  내가 쓴 모집글
    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<List<ProjectPostResponse>>> getMyProjects(@LoginUser Long userId) {
        return ResponseEntity.ok(ApiResponse.success(projectPostService.getMyProjects(userId)));
    }

    // GET /api/v1/users/me/applications  내 지원 내역
    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<List<MyApplicationResponse>>> getMyApplications(@LoginUser Long userId) {
        return ResponseEntity.ok(ApiResponse.success(projectPostService.getMyApplications(userId)));
    }
}
