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
}
