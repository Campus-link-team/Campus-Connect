package com.campuslink.campusconnect.domain.chat;

import com.campuslink.campusconnect.domain.chat.dto.*;
import com.campuslink.campusconnect.domain.user.User;
import com.campuslink.campusconnect.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // 1. 채팅방 생성 또는 기존 방 반환
    @Transactional
    public ChatRoomResponse createOrGetChatRoom(Long myUserId, ChatRoomCreateRequest request) {
        if (request.getContextType() == null || request.getContextId() == null || request.getParticipantUserId() == null) {
            throw new IllegalArgumentException("contextType, contextId, participantUserId는 필수입니다.");
        }
        if (myUserId.equals(request.getParticipantUserId())) {
            throw new IllegalArgumentException("자기 자신과는 채팅방을 생성할 수 없습니다.");
        }

        User me = userRepository.findById(myUserId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));
        User opponent = userRepository.findById(request.getParticipantUserId())
                .orElseThrow(() -> new IllegalArgumentException("상대방 정보를 찾을 수 없습니다."));

        ChatRoom room = chatRoomRepository.findExistingRoom(
                        request.getContextType().toUpperCase(),
                        request.getContextId(),
                        me.getId(),
                        opponent.getId()
                )
                .orElseGet(() -> chatRoomRepository.save(
                        new ChatRoom(request.getContextType().toUpperCase(), request.getContextId(), me, opponent)
                ));

        return toChatRoomResponse(room, myUserId);
    }

    // 2. 내 채팅방 목록 조회
    @Transactional(readOnly = true)
    public List<ChatRoomResponse> getMyChatRooms(Long myUserId) {
        return chatRoomRepository.findAllByUserId(myUserId)
                .stream()
                .map(room -> toChatRoomResponse(room, myUserId))
                .toList();
    }

    // 3. 채팅방 상세 조회
    @Transactional(readOnly = true)
    public ChatRoomResponse getChatRoomDetail(Long chatId, Long myUserId) {
        ChatRoom room = getValidatedRoom(chatId, myUserId);
        return toChatRoomResponse(room, myUserId);
    }

    // 4. 과거 메시지 내역 조회 (커서 페이징 + 시간순 정렬)
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(Long chatId, Long myUserId, Long cursor, int size) {
        getValidatedRoom(chatId, myUserId);

        PageRequest pageable = PageRequest.of(0, Math.min(Math.max(size, 1), 100));
        List<ChatMessage> messages = (cursor == null)
                ? chatMessageRepository.findByChatRoomIdOrderByIdDesc(chatId, pageable)
                : chatMessageRepository.findByChatRoomIdAndIdLessThanOrderByIdDesc(chatId, cursor, pageable);

        List<ChatMessage> ordered = new ArrayList<>(messages);
        Collections.reverse(ordered);

        return ordered.stream()
                .map(ChatMessageResponse::new)
                .toList();
    }

    // 5. 메시지 전송 (DB 저장 + WebSocket 브로드캐스트 동시 처리)
    @Transactional
    public ChatMessageResponse sendMessage(Long chatId, Long senderId, String content) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("메시지 내용은 비어 있을 수 없습니다.");
        }

        ChatRoom room = getValidatedRoom(chatId, senderId);
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("발신자 정보를 찾을 수 없습니다."));

        ChatMessage saved = chatMessageRepository.save(new ChatMessage(room, sender, content));
        room.updateLastActivity();

        // 기존 WebSocket 구독자(/sub/chat/room/{chatId})에게도 실시간 전파
        ChatMessageDto wsPayload = new ChatMessageDto(sender.getId(), sender.getName(), saved.getMessage());
        messagingTemplate.convertAndSend("/sub/chat/room/" + chatId, wsPayload);

        return new ChatMessageResponse(saved);
    }

    // 6. 채팅방 메시지 읽음 처리
    @Transactional
    public void markAsRead(Long chatId, Long myUserId) {
        getValidatedRoom(chatId, myUserId);
        chatMessageRepository.markMessagesAsRead(chatId, myUserId);
    }

    private ChatRoom getValidatedRoom(Long chatId, Long userId) {
        ChatRoom room = chatRoomRepository.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다. id=" + chatId));
        if (!room.isParticipant(userId)) {
            throw new IllegalStateException("해당 채팅방의 참여자가 아닙니다.");
        }
        return room;
    }

    private ChatRoomResponse toChatRoomResponse(ChatRoom room, Long myUserId) {
        User opponent = room.getOpponent(myUserId);
        ChatMessage lastMsg = chatMessageRepository.findTopByChatRoomOrderByIdDesc(room).orElse(null);
        long unreadCount = chatMessageRepository.countByChatRoomAndSenderIdNotAndIsReadFalse(room, myUserId);

        return new ChatRoomResponse(
                room.getId(),
                room.getContextType(),
                room.getContextId(),
                opponent.getId(),
                opponent.getName(),
                lastMsg != null ? lastMsg.getMessage() : null,
                lastMsg != null ? lastMsg.getSendTime() : room.getCreatedAt(),
                unreadCount
        );
    }
}