package com.campuslink.campusconnect.domain.review;

import com.campuslink.campusconnect.domain.bookpost.BookPost;
import com.campuslink.campusconnect.domain.bookpost.BookPostRepository;
import com.campuslink.campusconnect.domain.bookpost.SaleStatus;
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
    private final BookPostRepository bookPostRepository;
    private final UserRepository userRepository;

    // 1. 판매글 거래 후기 작성
    @Transactional
    public Long createReview(Long bookPostId, Long reviewerId, ReviewCreateRequest request) {
        validateRequest(request);

        BookPost bookPost = bookPostRepository.findById(bookPostId)
            .orElseThrow(() -> new IllegalArgumentException("해당 중고책 판매글을 찾을 수 없습니다. id=" + bookPostId));

        // 1) 거래 완료(SOLD) 상태인지 확인
        if (bookPost.getStatus() != SaleStatus.SOLD) {
            throw new IllegalStateException("거래 완료된 판매글에만 후기를 작성할 수 있습니다.");
        }

        // 2) 구매자 없이 거래완료된 판매글은 후기 작성 불가
        if (bookPost.getBuyer() == null) {
            throw new IllegalStateException("구매자 정보가 없는 판매글에는 후기를 작성할 수 없습니다.");
        }

        // 3) 로그인한 사용자가 해당 판매글의 구매자인지 검증
        if (!bookPost.getBuyer().getId().equals(reviewerId)) {
            throw new IllegalStateException("해당 판매글의 구매자만 후기를 작성할 수 있습니다.");
        }

        // 4) 판매글당 1회만 작성 가능
        if (reviewRepository.existsByBookPost(bookPost)) {
            throw new IllegalStateException("이미 해당 판매글에 대한 후기를 작성했습니다.");
        }

        User reviewer = userRepository.findById(reviewerId)
            .orElseThrow(() -> new IllegalArgumentException("작성자 정보를 찾을 수 없습니다."));

        // 5) 후기 대상(판매자)은 판매글에서 자동으로 지정
        User seller = bookPost.getSeller();

        Review review = new Review(
            bookPost,
            reviewer,
            seller,
            request.getRating(),
            request.getComment()
        );

        return reviewRepository.save(review).getId();
    }

    // 2. 특정 판매자가 받은 후기 목록 조회
    @Transactional(readOnly = true)
    public List<ReviewResponse> getUserReviews(Long userId) {
        User target = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return reviewRepository.findAllByTargetOrderByCreatedAtDesc(target)
            .stream()
            .map(ReviewResponse::new)
            .toList();
    }

    // 3. 특정 판매글의 후기 조회
    @Transactional(readOnly = true)
    public ReviewResponse getBookPostReview(Long bookPostId) {
        BookPost bookPost = bookPostRepository.findById(bookPostId)
            .orElseThrow(() -> new IllegalArgumentException("해당 중고책 판매글을 찾을 수 없습니다. id=" + bookPostId));

        return reviewRepository.findByBookPost(bookPost)
            .map(ReviewResponse::new)
            .orElse(null);
    }

    private void validateRequest(ReviewCreateRequest request) {
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("별점은 1점 이상 5점 이하의 정수여야 합니다.");
        }
        if (request.getComment() != null && request.getComment().length() > 500) {
            throw new IllegalArgumentException("후기는 최대 500자까지 입력할 수 있습니다.");
        }
    }
}
