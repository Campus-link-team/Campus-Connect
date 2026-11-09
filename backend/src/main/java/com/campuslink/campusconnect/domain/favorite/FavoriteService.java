package com.campuslink.campusconnect.domain.favorite;

import com.campuslink.campusconnect.domain.bookpost.BookPost;
import com.campuslink.campusconnect.domain.bookpost.BookPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final BookPostRepository bookPostRepository;

    @Transactional
    public String toggleFavorite(Long bookPostId, Long userId) {
        // 1. 찜하려는 중고책 게시글 조회
        BookPost bookPost = bookPostRepository.findById(bookPostId)
                .orElseThrow(() -> new IllegalArgumentException("해당 중고책 게시글을 찾을 수 없습니다."));

        // 2. 찜 내역 조회
        Optional<Favorite> existingFavorite = favoriteRepository.findByUserIdAndBookPost(userId, bookPost);

        if (existingFavorite.isPresent()) {
            // 3-1. 이미 찜한 상태라면 찜 취소 (삭제)
            favoriteRepository.delete(existingFavorite.get());
            return "찜이 취소되었습니다.";
        } else {
            // 3-2. 찜하지 않은 상태라면 찜 등록 (생성)
            Favorite favorite = new Favorite(userId, bookPost);
            favoriteRepository.save(favorite);
            return "찜이 등록되었습니다.";
        }
    }
}