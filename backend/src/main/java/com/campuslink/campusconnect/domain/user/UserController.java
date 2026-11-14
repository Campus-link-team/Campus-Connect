package com.campuslink.campusconnect.domain.user;

import com.campuslink.campusconnect.domain.user.dto.MyPageResponse;
import com.campuslink.campusconnect.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/users/{userId}/mypage
    // UserController.java 내의 기존 메서드를 아래처럼 수정합니다.
    @GetMapping("/{userId}/mypage")
    public ResponseEntity<ApiResponse<MyPageResponse>> getMyPage(@PathVariable Long userId) {
        MyPageResponse response = userService.getMyPage(userId);
        // ApiResponse.success()로 한 번 감싸서 반환!
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}