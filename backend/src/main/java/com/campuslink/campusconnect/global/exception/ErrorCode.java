package com.campuslink.campusconnect.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

// docs/api/auth.md 의 에러 code 와 맞춰서 관리
@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    INVALID_INPUT(HttpStatus.BAD_REQUEST, "입력값이 올바르지 않습니다."),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 가입된 이메일입니다."),
    NICKNAME_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 사용 중인 닉네임입니다."),
    LOGIN_FAILED(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 일치하지 않습니다."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증이 필요합니다."),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "토큰이 만료되었습니다. 다시 로그인해 주세요."),
    CONFLICT(HttpStatus.CONFLICT, "요청을 처리할 수 없는 상태입니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),

    // 학교 이메일 인증 (3.2, Mock)
    INVALID_SCHOOL_EMAIL(HttpStatus.BAD_REQUEST, "학교 이메일만 사용할 수 있습니다."),
    VERIFICATION_NOT_REQUESTED(HttpStatus.BAD_REQUEST, "인증 코드를 먼저 요청해 주세요."),
    VERIFICATION_CODE_MISMATCH(HttpStatus.BAD_REQUEST, "인증 코드가 일치하지 않습니다."),
    VERIFICATION_CODE_EXPIRED(HttpStatus.BAD_REQUEST, "인증 코드가 만료되었습니다. 다시 요청해 주세요."),
    EMAIL_NOT_VERIFIED(HttpStatus.BAD_REQUEST, "이메일 인증을 먼저 완료해 주세요."),

    // 중고책 (3.3 ~ 3.5)
    BOOK_POST_NOT_FOUND(HttpStatus.NOT_FOUND, "판매글을 찾을 수 없습니다."),
    NOT_BOOK_POST_OWNER(HttpStatus.FORBIDDEN, "판매글 작성자만 할 수 있습니다."),
    INVALID_BUYER(HttpStatus.BAD_REQUEST, "해당 판매글로 채팅한 회원만 구매자로 지정할 수 있습니다."),
    ALREADY_SOLD(HttpStatus.CONFLICT, "거래가 완료된 판매글은 상태를 변경할 수 없습니다."),
    BOOK_POST_HAS_CHAT(HttpStatus.CONFLICT, "채팅이 진행된 판매글은 삭제할 수 없습니다.");

    private final HttpStatus status;
    private final String message;
}