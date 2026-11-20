package com.campuslink.campusconnect.domain.review;

import com.campuslink.campusconnect.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    // 거래당 1회 평가 제한 검증용
    boolean existsByTransactionIdAndReviewer(Long transactionId, User reviewer);

    // 특정 사용자가 받은 평가 목록 조회 (최신순)
    List<Review> findAllByTargetOrderByCreatedAtDesc(User target);
}