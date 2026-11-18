package com.campuslink.campusconnect.domain.chat;

import com.campuslink.campusconnect.domain.chat.dto.*;
import com.campuslink.campusconnect.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chats")
@RequiredArgsConstructor
public class ChatRestController {

    private final ChatService chatService;

    // 1. 채팅방 생성 또는 기존 방 반환 (POST /api/v1/chats)
    @PostMapping
    public ResponseEntity<ApiResponse<ChatRoomResponse>> createOrGetChatRoom(
            @RequestParam(defaultValue = "1") Long userId,
            @RequestBody ChatRoomCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(chatService.createOrGetChatRoom(userId, request)));
    }

    // 2. 내 채팅방 목록 조회 (GET /api/v1/chats)
    @GetMapping
    public ResponseEntity<ApiResponse<List<ChatRoomResponse>>> getMyChatRooms(
            @RequestParam(defaultValue = "1") Long userId) {
        return ResponseEntity.ok(ApiResponse.success(chatService.getMyChatRooms(userId)));
    }

    // 3. 채팅방 상세 조회 (GET /api/v1/chats/{chatId})
    @GetMapping("/{chatId}")
    public ResponseEntity<ApiResponse<ChatRoomResponse>> getChatRoomDetail(
            @PathVariable Long chatId,
            @RequestParam(defaultValue = "1") Long userId) {
        return ResponseEntity.ok(ApiResponse.success(chatService.getChatRoomDetail(chatId, userId)));
    }

    // 4. 과거 메시지 내역 조회 (GET /api/v1/chats/{chatId}/messages)
    @GetMapping("/{chatId}/messages")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getMessages(
            @PathVariable Long chatId,
            @RequestParam(defaultValue = "1") Long userId,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "30") int size) {
        return ResponseEntity.ok(ApiResponse.success(chatService.getMessages(chatId, userId, cursor, size)));
    }

    // 5. REST 메시지 전송 (POST /api/v1/chats/{chatId}/messages)
    @PostMapping("/{chatId}/messages")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @PathVariable Long chatId,
            @RequestParam(defaultValue = "1") Long userId,
            @RequestBody ChatMessageSendRequest request) {
        ChatMessageResponse response = chatService.sendMessage(chatId, userId, request.getMessage());
        return ResponseEntity.status(201).body(ApiResponse.success(response));
    }

    // 6. 채팅방 읽음 처리 (POST /api/v1/chats/{chatId}/read)
    @PostMapping("/{chatId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long chatId,
            @RequestParam(defaultValue = "1") Long userId) {
        chatService.markAsRead(chatId, userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}