package com.campuslink.campusconnect.domain.favorite;

import com.campuslink.campusconnect.domain.bookpost.BookPost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    // 특정 유저와 특정 중고책 게시글의 찜 내역이 있는지 조회
    Optional<Favorite> findByUserIdAndBookPost(Long userId, BookPost bookPost);
}