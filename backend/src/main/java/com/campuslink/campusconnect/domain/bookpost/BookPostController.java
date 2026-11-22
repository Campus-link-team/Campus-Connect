package com.campuslink.campusconnect.domain.bookpost;

import com.campuslink.campusconnect.domain.bookpost.dto.BookPostCreateRequest;
import com.campuslink.campusconnect.domain.bookpost.dto.BookPostResponse;
import com.campuslink.campusconnect.domain.bookpost.dto.BookPostUpdateRequest;
import com.campuslink.campusconnect.domain.bookpost.dto.BookStatusUpdateRequest;
import com.campuslink.campusconnect.domain.bookpost.dto.ChatPartnerResponse;
import com.campuslink.campusconnect.global.common.ApiResponse;
import com.campuslink.campusconnect.global.security.LoginUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// 중고책 판매글 API (docs/api/books.md)
@RestController
@RequestMapping("/api/v1/books")
@RequiredArgsConstructor
public class BookPostController {

    private final BookPostService bookPostService;

    // POST /api/v1/books
    @PostMapping
    public ResponseEntity<ApiResponse<BookPostResponse>> create(
            @LoginUser Long userId,
            @Valid @RequestBody BookPostCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(bookPostService.create(userId, request)));
    }

    // GET /api/v1/books?category=MAJOR&status=ON_SALE&keyword=자료구조
    @GetMapping
    public ResponseEntity<ApiResponse<List<BookPostResponse>>> getList(
            @RequestParam(required = false) BookCategory category,
            @RequestParam(required = false) SaleStatus status,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(ApiResponse.success(bookPostService.getList(category, status, keyword)));
    }

    // GET /api/v1/books/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookPostResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookPostService.get(id)));
    }

    // PATCH /api/v1/books/{id}  (작성자만, 보낸 필드만 수정 - 모집글 수정과 같은 방식)
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<BookPostResponse>> update(
            @LoginUser Long userId,
            @PathVariable Long id,
            @Valid @RequestBody BookPostUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(bookPostService.update(userId, id, request)));
    }

    // DELETE /api/v1/books/{id}  (작성자만)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@LoginUser Long userId, @PathVariable Long id) {
        bookPostService.delete(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // PATCH /api/v1/books/{id}/status  { "status": "SOLD", "buyerId": 3 }  (작성자만, buyerId 선택)
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<BookPostResponse>> changeStatus(
            @LoginUser Long userId,
            @PathVariable Long id,
            @Valid @RequestBody BookStatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(bookPostService.changeStatus(userId, id, request)));
    }

    // GET /api/v1/books/{id}/chat-partners  (작성자만) 거래완료 시 고를 구매자 후보
    @GetMapping("/{id}/chat-partners")
    public ResponseEntity<ApiResponse<List<ChatPartnerResponse>>> getChatPartners(
            @LoginUser Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookPostService.getChatPartners(userId, id)));
    }
}
