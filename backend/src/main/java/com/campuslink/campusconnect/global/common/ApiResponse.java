package com.campuslink.campusconnect.global.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiResponse<T> {

    private T data;
    private ErrorResponse error;

    // 1. 정상 작동했을 때 부르는 메서드
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(data, null);
    }

    // 2. 에러 났을 때 부르는 메서드 (GlobalExceptionHandler에서 사용)
    public static <T> ApiResponse<T> error(String code, String message) {
        return new ApiResponse<>(null, new ErrorResponse(code, message));
    }

    @Getter
    @AllArgsConstructor
    public static class ErrorResponse {
        private String code;
        private String message;
    }
}