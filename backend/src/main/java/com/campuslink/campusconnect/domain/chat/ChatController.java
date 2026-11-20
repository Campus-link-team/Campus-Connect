package com.campuslink.campusconnect.domain.chat;

import com.campuslink.campusconnect.domain.chat.dto.ChatMessageDto;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat/message/{roomId}")
    public void sendMessage(
            @DestinationVariable Long roomId,
            @Payload ChatMessageDto messageDto) {
        chatService.sendMessage(roomId, messageDto.getSenderId(), messageDto.getMessage());
    }

    @MessageExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public void handleWebSocketException(RuntimeException e) {
        System.out.println("웹소켓 채팅 에러 발생: " + e.getMessage());
    }
}