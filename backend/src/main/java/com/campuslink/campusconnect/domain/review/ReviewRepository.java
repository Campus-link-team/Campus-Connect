package com.campuslink.campusconnect.domain.review;

import com.campuslink.campusconnect.domain.bookpost.BookPost;
import com.campuslink.campusconnect.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // 판매글당 1회 작성 제한 검증
    boolean existsByBookPost(BookPost bookPost);

    // 특정 판매글에 작성된 후기 조회
    Optional<Review> findByBookPost(BookPost bookPost);

    // 특정 사용자가 받은 후기 목록 조회 (최신순)
    List<Review> findAllByTargetOrderByCreatedAtDesc(User target);
}
