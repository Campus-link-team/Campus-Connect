package com.campuslink.campusconnect.domain.auth.dto;

// expiresIn: 인증 코드 유효 시간(초)
// mockCode: Mock 방식이라 실제 메일 대신 응답으로 코드를 돌려준다. 실제 메일 발송으로 바꾸면 이 필드를 지운다.
public record EmailSendResponse(long expiresIn, String mockCode) {
}
