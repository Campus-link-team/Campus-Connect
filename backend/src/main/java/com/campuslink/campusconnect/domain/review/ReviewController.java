package com.campuslink.campusconnect.domain.review;

import com.campuslink.campusconnect.domain.review.dto.ReviewCreateRequest;
import com.campuslink.campusconnect.domain.review.dto.ReviewResponse;
import com.campuslink.campusconnect.global.common.ApiResponse;
import com.campuslink.campusconnect.global.security.LoginUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // 1. 판매글 후기 등록 (POST /api/v1/books/{bookPostId}/reviews)
    @PostMapping("/books/{bookPostId}/reviews")
    public ResponseEntity<ApiResponse<Long>> createReview(
        @PathVariable Long bookPostId,
        @LoginUser Long userId,
        @RequestBody ReviewCreateRequest request) {
        Long reviewId = reviewService.createReview(bookPostId, userId, request);
        return ResponseEntity.status(201).body(ApiResponse.success(reviewId));
    }

    // 2. 판매글 후기 단건 조회 (GET /api/v1/books/{bookPostId}/reviews)
    @GetMapping("/books/{bookPostId}/reviews")
    public ResponseEntity<ApiResponse<ReviewResponse>> getBookPostReview(@PathVariable Long bookPostId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getBookPostReview(bookPostId)));
    }

    // 3. 특정 사용자가 받은 후기 목록 조회 (GET /api/v1/users/{userId}/reviews)
    @GetMapping("/users/{userId}/reviews")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getUserReviews(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getUserReviews(userId)));
    }
}
