package com.campuslink.campusconnect.domain.favorite;

import com.campuslink.campusconnect.domain.bookpost.BookPost;
import com.campuslink.campusconnect.domain.bookpost.BookPostRepository;
import com.campuslink.campusconnect.domain.user.User;
import com.campuslink.campusconnect.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final BookPostRepository bookPostRepository;
    // 1. 유저를 찾기 위해 UserRepository를 주입받습니다.
    private final UserRepository userRepository;

    @Transactional
    public String toggleFavorite(Long bookPostId, Long userId) {
        // 1. 찜하려는 중고책 게시글 조회
        BookPost bookPost = bookPostRepository.findById(bookPostId)
                .orElseThrow(() -> new IllegalArgumentException("해당 중고책 게시글을 찾을 수 없습니다."));

        // 2. 전달받은 userId로 User 객체를 DB에서 조회합니다. (새로 추가된 부분)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저를 찾을 수 없습니다. id=" + userId));

        // 3. 찜 내역 조회 (userId 대신 찾아온 user 객체를 넘겨줍니다)
        Optional<Favorite> existingFavorite = favoriteRepository.findByUserAndBookPost(user, bookPost);

        if (existingFavorite.isPresent()) {
            // 3-1. 이미 찜한 상태라면 찜 취소 (삭제)
            favoriteRepository.delete(existingFavorite.get());
            return "찜이 취소되었습니다.";
        } else {
            // 3-2. 찜하지 않은 상태라면 찜 등록 (생성)
            Favorite favorite = new Favorite(user, bookPost); // 이제 오류 없이 들어갑니다!
            favoriteRepository.save(favorite);
            return "찜이 등록되었습니다.";
        }
    }
}