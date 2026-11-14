package com.campuslink.campusconnect.domain.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    // 동일 게시글 + 동일 두 사용자 간의 기존 채팅방 중복 생성 방지용 조회
    @Query("SELECT r FROM ChatRoom r WHERE r.contextType = :contextType AND r.contextId = :contextId " +
            "AND ((r.user1.id = :userAId AND r.user2.id = :userBId) OR (r.user1.id = :userBId AND r.user2.id = :userAId))")
    Optional<ChatRoom> findExistingRoom(
            @Param("contextType") String contextType,
            @Param("contextId") Long contextId,
            @Param("userAId") Long userAId,
            @Param("userBId") Long userBId
    );

    // 내가 참여한 채팅방 목록 (최근 대화순)
    @Query("SELECT r FROM ChatRoom r WHERE r.user1.id = :userId OR r.user2.id = :userId ORDER BY r.updatedAt DESC")
    List<ChatRoom> findAllByUserId(@Param("userId") Long userId);
}