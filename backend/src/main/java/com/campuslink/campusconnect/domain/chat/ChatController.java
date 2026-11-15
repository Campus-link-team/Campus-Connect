package com.campuslink.campusconnect.domain.chat;

import com.campuslink.campusconnect.domain.chat.dto.ChatMessageDto;
import com.campuslink.campusconnect.domain.user.User;
import com.campuslink.campusconnect.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

@Controller // 뷰 반환이나 일반 HTTP 통신이 아닌 웹소켓 메시지를 처리하므로 @RestController가 아닌 @Controller를 사용합니다.
@RequiredArgsConstructor
public class ChatController {

    // 특정 방으로 메시지를 쏴주는 스프링의 우체부 객체
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;

    /**
     * 클라이언트가 "/pub/chat/message/{roomId}" 경로로 메시지를 보내면 이 메서드가 실행됩니다.
     * @param roomId 채팅방 번호
     * @param messageDto 프론트엔드에서 보낸 메시지 데이터 (아직 안 만들었으니 2단계에서 만들 겁니다!)
     */
    @MessageMapping("/chat/message/{roomId}")
    @Transactional
    public void sendMessage(
            @DestinationVariable Long roomId,
            @Payload ChatMessageDto messageDto) {

        // 1. DB에서 채팅방 조회
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방이 존재하지 않습니다."));

        // 2. DB에서 메시지 발신자(User) 조회
        User sender = userRepository.findById(messageDto.getSenderId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 3. 메시지 내용을 DB에 저장 (영속성)
        ChatMessage chatMessage = new ChatMessage(room, sender, messageDto.getMessage());
        chatMessageRepository.save(chatMessage);

        // 4. 저장한 메시지를 이 채팅방을 '구독(/sub/chat/room/{roomId})' 중인 모든 사람에게 방송(Broadcasting)
        // (프론트엔드에서 이 주소만 보고 있으면 새 메시지가 화면에 즉시 뜹니다.)
        messagingTemplate.convertAndSend("/sub/chat/room/" + roomId, messageDto);
    }
    /**
     * 웹소켓 채팅 중 에러(IllegalArgumentException)가 발생하면,
     * 에러 메시지를 발송자에게만 조용히 반환해주는 전용 에러 핸들러입니다.
     */
    @MessageExceptionHandler(IllegalArgumentException.class)
    public void handleWebSocketException(IllegalArgumentException e) {
        // 실제 운영 환경에서는 별도의 에러 전송 채널(예: /queue/errors)을 만들어 프론트엔드로 에러를 보내주지만,
        // 현재는 서버 콘솔에 안전하게 로그만 남기고 서버가 죽지 않도록 방어합니다.
        System.out.println("웹소켓 채팅 에러 발생: " + e.getMessage());
    }
}