package com.campuslink.campusconnect.domain.review;

import com.campuslink.campusconnect.domain.review.dto.MannerSummaryResponse;
import com.campuslink.campusconnect.domain.review.dto.ReviewCreateRequest;
import com.campuslink.campusconnect.domain.review.dto.ReviewResponse;
import com.campuslink.campusconnect.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // 1. 거래 평가 등록 (POST /api/v1/transactions/{transactionId}/reviews)
    @PostMapping("/transactions/{transactionId}/reviews")
    public ResponseEntity<ApiResponse<Long>> createReview(
            @PathVariable Long transactionId,
            @RequestParam(defaultValue = "1") Long userId, // 인증 연동 전 테스트용 기본값
            @RequestBody ReviewCreateRequest request) {
        Long reviewId = reviewService.createReview(transactionId, userId, request);
        return ResponseEntity.status(201).body(ApiResponse.success(reviewId));
    }

    // 2. 받은 평가 목록 조회 (GET /api/v1/users/{userId}/reviews)
    @GetMapping("/users/{userId}/reviews")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getUserReviews(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getUserReviews(userId)));
    }

    // 3. 매너 온도 요약 조회 (GET /api/v1/users/{userId}/manner-summary)
    @GetMapping("/users/{userId}/manner-summary")
    public ResponseEntity<ApiResponse<MannerSummaryResponse>> getMannerSummary(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getMannerSummary(userId)));
    }
}