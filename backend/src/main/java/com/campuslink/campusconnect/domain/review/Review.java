package com.campuslink.campusconnect.domain.review;

import com.campuslink.campusconnect.domain.bookpost.BookPost;
import com.campuslink.campusconnect.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 판매글당 1회만 작성 가능하도록 1:1 매핑 및 unique 제약 설정
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_post_id", nullable = false, unique = true)
    private BookPost bookPost;

    // 후기 작성자 (구매자)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    // 후기 대상 (판매자)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_id", nullable = false)
    private User target;

    @Column(nullable = false)
    private int rating; // 1 ~ 5

    @Column(length = 500)
    private String comment;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Review(BookPost bookPost, User reviewer, User target, int rating, String comment) {
        this.bookPost = bookPost;
        this.reviewer = reviewer;
        this.target = target;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = LocalDateTime.now();
    }
}
