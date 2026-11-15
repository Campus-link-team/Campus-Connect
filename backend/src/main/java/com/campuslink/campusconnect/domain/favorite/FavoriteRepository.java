package com.campuslink.campusconnect.domain.favorite;

import com.campuslink.campusconnect.domain.bookpost.BookPost;
import com.campuslink.campusconnect.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    // 수정 전: findByUserIdAndBookPost
    // 수정 후: findByUserAndBookPost
    Optional<Favorite> findByUserAndBookPost(User user, BookPost bookPost);
}