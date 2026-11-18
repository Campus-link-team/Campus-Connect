package com.campuslink.campusconnect.domain.chat;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // 채팅방의 가장 최근 메시지 1건 조회
    Optional<ChatMessage> findTopByChatRoomOrderByIdDesc(ChatRoom chatRoom);

    // 상대방이 보낸 메시지 중 내가 아직 읽지 않은 메시지 수
    long countByChatRoomAndSenderIdNotAndIsReadFalse(ChatRoom chatRoom, Long userId);

    // 커서 기반 과거 메시지 내역 조회 (최신순으로 size만큼 가져온 뒤 서비스에서 시간순 정렬)
    List<ChatMessage> findByChatRoomIdOrderByIdDesc(Long chatRoomId, Pageable pageable);

    List<ChatMessage> findByChatRoomIdAndIdLessThanOrderByIdDesc(Long chatRoomId, Long cursor, Pageable pageable);

    // 채팅방 입장/읽음 처리 시 상대방 메시지를 일괄 읽음 상태로 변경
    @Modifying(clearAutomatically = true)
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.chatRoom.id = :chatRoomId AND m.sender.id <> :userId AND m.isRead = false")
    int markMessagesAsRead(@Param("chatRoomId") Long chatRoomId, @Param("userId") Long userId);
}