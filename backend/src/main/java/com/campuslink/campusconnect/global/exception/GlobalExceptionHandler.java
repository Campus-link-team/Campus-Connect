package com.campuslink.campusconnect.global.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException e) {
        ErrorCode code = e.getErrorCode();
        return ResponseEntity.status(code.getStatus()).body(ErrorResponse.of(code));
    }

    // @RequestBody @Valid 검증 실패
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleBodyValidation(MethodArgumentNotValidException e) {
        FieldError fieldError = e.getBindingResult().getFieldError();
        String message = fieldError != null ? fieldError.getDefaultMessage() : ErrorCode.INVALID_INPUT.getMessage();
        return ResponseEntity.badRequest().body(ErrorResponse.of(ErrorCode.INVALID_INPUT, message));
    }

    // @RequestParam 등 메서드 파라미터 검증 실패
    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ErrorResponse> handleParamValidation(HandlerMethodValidationException e) {
        String message = e.getAllErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse(ErrorCode.INVALID_INPUT.getMessage());
        return ResponseEntity.badRequest().body(ErrorResponse.of(ErrorCode.INVALID_INPUT, message));
    }

    // develop 쪽 처리기에서 옮겨옴: 잘못된 요청 (예: 없는 모집글)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(ErrorResponse.of(ErrorCode.INVALID_INPUT, e.getMessage()));
    }

    // develop 쪽 처리기에서 옮겨옴: 처리할 수 없는 상태 (예: 모집 마감, 중복 지원)
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ErrorResponse.of(ErrorCode.CONFLICT, e.getMessage()));
    }
}
