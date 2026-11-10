package com.campuslink.campusconnect.domain.chat;

import com.campuslink.campusconnect.domain.bookpost.BookPost;
import com.campuslink.campusconnect.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class) // 생성 시간 자동 기록용
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 대화가 일어나는 대상 게시글
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_post_id", nullable = false)
    private BookPost bookPost;

    // 채팅을 먼저 건 사람 (구매 희망자)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt; // 채팅방 생성 시각

    public ChatRoom(BookPost bookPost, User buyer) {
        this.bookPost = bookPost;
        this.buyer = buyer;
    }
}