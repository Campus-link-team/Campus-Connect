package com.campuslink.campusconnect.global.error;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice // 프로젝트 전체에서 발생하는 에러를 감지하는 어노테이션
public class GlobalExceptionHandler {

    // 1. 우리가 코드 곳곳에 적어둔 IllegalArgumentException 처리
    // (예: "해당 유저를 찾을 수 없습니다", "해당 게시글을 찾을 수 없습니다")
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException e) {
        // 에러 메시지만 깔끔하게 뽑아서 400 Bad Request 상태 코드와 함께 반환합니다.
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }

    // 2. 우리가 적어둔 IllegalStateException 처리
    // (예: "이미 정원이 마감된 모집글입니다", "이미 지원한 게시글입니다")
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalStateException(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    // 3. 그 외 예상치 못한 모든 에러 처리 (서버 다운 방지)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 내부 오류가 발생했습니다: " + e.getMessage());
    }
}