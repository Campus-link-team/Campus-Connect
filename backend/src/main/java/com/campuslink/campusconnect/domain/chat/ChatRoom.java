package com.campuslink.campusconnect.domain.chat;

import com.campuslink.campusconnect.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // "BOOK" 또는 "PROJECT"
    @Column(name = "context_type", nullable = false)
    private String contextType;

    // 대상 게시글 ID (중고책 ID 또는 프로젝트 모집글 ID)
    @Column(name = "context_id", nullable = false)
    private Long contextId;

    // 채팅방을 먼저 연 사용자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1;

    // 채팅 상대방 (게시글 작성자 등)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user2_id", nullable = false)
    private User user2;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public ChatRoom(String contextType, Long contextId, User user1, User user2) {
        this.contextType = contextType;
        this.contextId = contextId;
        this.user1 = user1;
        this.user2 = user2;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isParticipant(Long userId) {
        return user1.getId().equals(userId) || user2.getId().equals(userId);
    }

    public User getOpponent(Long myUserId) {
        return user1.getId().equals(myUserId) ? user2 : user1;
    }

    public void updateLastActivity() {
        this.updatedAt = LocalDateTime.now();
    }
}