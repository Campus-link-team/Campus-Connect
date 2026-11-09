package com.campuslink.campusconnect.domain.user;

import com.campuslink.campusconnect.domain.user.dto.UserResponse;
import com.campuslink.campusconnect.global.security.LoginUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/users/me  (Authorization: Bearer {accessToken} 필요)
    @GetMapping("/me")
    public UserResponse getMe(@LoginUser Long userId) {
        return userService.getMe(userId);
    }
}
