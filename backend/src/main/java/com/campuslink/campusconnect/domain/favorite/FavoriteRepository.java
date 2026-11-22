package com.campuslink.campusconnect.domain.favorite;

import com.campuslink.campusconnect.domain.bookpost.BookPost;
import com.campuslink.campusconnect.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    // 수정 전: findByUserIdAndBookPost
    // 수정 후: findByUserAndBookPost
    Optional<Favorite> findByUserAndBookPost(User user, BookPost bookPost);

    // 내가 찜한 판매글 (최근에 찜한 순, 마이페이지)
    @Query("select f from Favorite f join fetch f.bookPost b join fetch b.seller where f.user.id = :userId order by f.id desc")
    List<Favorite> findMine(@Param("userId") Long userId);
}
