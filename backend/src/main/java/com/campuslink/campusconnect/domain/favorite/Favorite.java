package com.campuslink.campusconnect.domain.favorite;

import com.campuslink.campusconnect.domain.bookpost.BookPost; // 동료가 만든 클래스 임포트 필요
// import com.campuslink.campusconnect.domain.user.User; // 추후 User 엔티티 생성 시 사용

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 회원이 찜했는지 (임시로 Long 타입 userId 사용)
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // 어떤 중고책 판매글을 찜했는지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_post_id", nullable = false)
    private BookPost bookPost;

    public Favorite(Long userId, BookPost bookPost) {
        this.userId = userId;
        this.bookPost = bookPost;
    }
}