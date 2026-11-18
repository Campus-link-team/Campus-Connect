package com.campuslink.campusconnect.domain.chat.dto;

import com.campuslink.campusconnect.domain.chat.ChatMessage;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ChatMessageResponse {
    private final Long messageId;
    private final Long chatId;
    private final Long senderId;
    private final String senderName;
    private final String message;
    private final boolean isRead;
    private final LocalDateTime sendTime;

    public ChatMessageResponse(ChatMessage entity) {
        this.messageId = entity.getId();
        this.chatId = entity.getChatRoom().getId();
        this.senderId = entity.getSender().getId();
        this.senderName = entity.getSender().getName();
        this.message = entity.getMessage();
        this.isRead = entity.isRead();
        this.sendTime = entity.getSendTime();
    }
}