package com.campuslink.campusconnect.domain.chat.dto;

import lombok.Getter;

@Getter
public class ChatRoomCreateRequest {
    private String contextType;       // "BOOK" 또는 "PROJECT"
    private Long contextId;           // 게시글 ID
    private Long participantUserId;   // 상대방 사용자 ID
}