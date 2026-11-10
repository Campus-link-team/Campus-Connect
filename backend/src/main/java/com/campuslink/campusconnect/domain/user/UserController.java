package com.campuslink.campusconnect.domain.user;

import com.campuslink.campusconnect.domain.user.dto.MyPageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/users/{userId}/mypage
    @GetMapping("/{userId}/mypage")
    public ResponseEntity<MyPageResponse> getMyPage(@PathVariable Long userId) {
        MyPageResponse response = userService.getMyPage(userId);
        return ResponseEntity.ok(response);
    }
}