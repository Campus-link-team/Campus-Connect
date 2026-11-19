package com.campuslink.campusconnect.global.exception;

import lombok.Getter;

// 서비스 로직에서 throw new BusinessException(ErrorCode.XXX) 로 사용
@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    // 기본 메시지 대신 상황에 맞는 메시지를 내려줄 때 사용
    public BusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
}
