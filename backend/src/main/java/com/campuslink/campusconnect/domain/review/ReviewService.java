package com.campuslink.campusconnect.domain.review;

import com.campuslink.campusconnect.domain.review.dto.MannerSummaryResponse;
import com.campuslink.campusconnect.domain.review.dto.ReviewCreateRequest;
import com.campuslink.campusconnect.domain.review.dto.ReviewResponse;
import com.campuslink.campusconnect.domain.user.User;
import com.campuslink.campusconnect.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    // 1. 거래 평가 등록
    @Transactional
    public Long createReview(Long transactionId, Long reviewerId, ReviewCreateRequest request) {
        validateRequest(request);

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new IllegalArgumentException("작성자 정보를 찾을 수 없습니다."));

        // TODO: 추후 Transaction 엔티티 병합 시 완료된 거래 여부 및 거래 당사자(seller/buyer) 검증 연결
        if (request.getTargetUserId() == null) {
            throw new IllegalArgumentException("평가 대상 사용자 ID가 필요합니다.");
        }
        User target = userRepository.findById(request.getTargetUserId())
                .orElseThrow(() -> new IllegalArgumentException("평가 대상 사용자를 찾을 수 없습니다."));

        if (reviewer.getId().equals(target.getId())) {
            throw new IllegalArgumentException("자기 자신은 평가할 수 없습니다.");
        }

        if (reviewRepository.existsByTransactionIdAndReviewer(transactionId, reviewer)) {
            throw new IllegalStateException("이미 해당 거래에 대한 평가를 작성했습니다.");
        }

        Review review = new Review(
                transactionId,
                reviewer,
                target,
                request.getRating(),
                request.getTags(),
                request.getComment()
        );

        return reviewRepository.save(review).getId();
    }

    // 2. 특정 사용자가 받은 평가 목록 조회
    @Transactional(readOnly = true)
    public List<ReviewResponse> getUserReviews(Long userId) {
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return reviewRepository.findAllByTargetOrderByCreatedAtDesc(target)
                .stream()
                .map(ReviewResponse::new)
                .toList();
    }

    // 3. 매너 온도 요약 조회 (명세서 공식: 36.5 + 평균 별점 * 0.5)
    @Transactional(readOnly = true)
    public MannerSummaryResponse getMannerSummary(Long userId) {
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<Review> reviews = reviewRepository.findAllByTargetOrderByCreatedAtDesc(target);
        long count = reviews.size();

        if (count == 0) {
            return new MannerSummaryResponse(userId, 0.0, 0, 36.5);
        }

        double avg = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        double roundedAvg = Math.round(avg * 10.0) / 10.0;
        double temperature = Math.round((36.5 + avg * 0.5) * 10.0) / 10.0;

        return new MannerSummaryResponse(userId, roundedAvg, count, temperature);
    }

    private void validateRequest(ReviewCreateRequest request) {
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("별점은 1점 이상 5점 이하의 정수여야 합니다.");
        }
        if (request.getTags() != null && request.getTags().size() > 5) {
            throw new IllegalArgumentException("태그는 최대 5개까지 선택할 수 있습니다.");
        }
        if (request.getComment() != null && request.getComment().length() > 500) {
            throw new IllegalArgumentException("후기는 최대 500자까지 입력할 수 있습니다.");
        }
        boolean hasTags = request.getTags() != null && !request.getTags().isEmpty();
        boolean hasComment = request.getComment() != null && !request.getComment().isBlank();
        if (!hasTags && !hasComment) {
            throw new IllegalArgumentException("태그 또는 후기 중 하나 이상 입력해야 합니다.");
        }
    }
}