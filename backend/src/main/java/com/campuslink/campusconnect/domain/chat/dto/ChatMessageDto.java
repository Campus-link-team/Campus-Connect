package com.campuslink.campusconnect.domain.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private Long senderId; // 누가 보냈는지
    private String senderName; // 프론트 화면에 띄워줄 이름
    private String message; // 메시지 내용
}