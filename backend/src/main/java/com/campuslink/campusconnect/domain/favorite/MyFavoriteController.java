package com.campuslink.campusconnect.domain.favorite;

import com.campuslink.campusconnect.domain.bookpost.dto.BookPostResponse;
import com.campuslink.campusconnect.global.common.ApiResponse;
import com.campuslink.campusconnect.global.security.LoginUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// 마이페이지의 찜 목록
@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
public class MyFavoriteController {

    private final FavoriteService favoriteService;

    // GET /api/v1/users/me/favorites  내가 찜한 판매글
    @GetMapping("/favorites")
    public ResponseEntity<ApiResponse<List<BookPostResponse>>> getMyFavorites(@LoginUser Long userId) {
        return ResponseEntity.ok(ApiResponse.success(favoriteService.getMyFavorites(userId)));
    }
}
