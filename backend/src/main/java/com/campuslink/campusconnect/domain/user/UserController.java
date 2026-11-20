package com.campuslink.campusconnect.domain.user;

import com.campuslink.campusconnect.domain.user.dto.MyPageResponse;
import com.campuslink.campusconnect.domain.user.dto.UserResponse;
import com.campuslink.campusconnect.global.common.ApiResponse;
import com.campuslink.campusconnect.global.security.LoginUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/v1/users/me (Authorization: Bearer {accessToken})
    @GetMapping("/me")
    public UserResponse getMe(@LoginUser Long userId) {
        return userService.getMe(userId);
    }

    // GET /api/v1/users/me/mypage (Authorization: Bearer {accessToken})
    // 경로의 userId 대신 토큰의 사용자 id를 사용 (ISS-04)
    @GetMapping("/me/mypage")
    public ResponseEntity<ApiResponse<MyPageResponse>> getMyPage(@LoginUser Long userId) {
        return ResponseEntity.ok(ApiResponse.success(userService.getMyPage(userId)));
    }
}
