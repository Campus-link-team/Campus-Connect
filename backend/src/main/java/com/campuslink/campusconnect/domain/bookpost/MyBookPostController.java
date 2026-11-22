package com.campuslink.campusconnect.domain.bookpost;

import com.campuslink.campusconnect.domain.bookpost.dto.BookPostResponse;
import com.campuslink.campusconnect.global.common.ApiResponse;
import com.campuslink.campusconnect.global.security.LoginUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// 마이페이지의 중고책 부분. 다른 마이페이지 목록과 충돌하지 않도록 UserController 대신 따로 둔다.
@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
public class MyBookPostController {

    private final BookPostService bookPostService;

    // GET /api/v1/users/me/books  내 판매글 목록
    @GetMapping("/books")
    public ResponseEntity<ApiResponse<List<BookPostResponse>>> getMyBooks(@LoginUser Long userId) {
        return ResponseEntity.ok(ApiResponse.success(bookPostService.getMine(userId)));
    }
}
