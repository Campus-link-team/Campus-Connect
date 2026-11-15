package com.campuslink.campusconnect.domain.user;

import com.campuslink.campusconnect.domain.user.dto.MyPageResponse;
import com.campuslink.campusconnect.domain.user.dto.UserResponse;
import com.campuslink.campusconnect.global.common.ApiResponse;
import com.campuslink.campusconnect.global.security.LoginUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/users/me (Authorization: Bearer {accessToken})
    @GetMapping("/me")
    public UserResponse getMe(@LoginUser Long userId) {
        return userService.getMe(userId);
    }

    // GET /api/users/{userId}/mypage  (ISS-04에서 토큰 방식으로 변경 예정)
    @GetMapping("/{userId}/mypage")
    public ResponseEntity<ApiResponse<MyPageResponse>> getMyPage(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(userService.getMyPage(userId)));
    }
}
