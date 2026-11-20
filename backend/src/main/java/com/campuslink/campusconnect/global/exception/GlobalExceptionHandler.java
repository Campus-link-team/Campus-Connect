package com.campuslink.campusconnect.global.exception;

import com.campuslink.campusconnect.global.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

// 모든 오류 응답은 { "data": null, "error": { "code": "...", "message": "..." } } 형식으로 통일
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusiness(BusinessException e) {
        return error(e.getErrorCode(), e.getMessage());
    }

    // @RequestBody @Valid 검증 실패
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleBodyValidation(MethodArgumentNotValidException e) {
        FieldError fieldError = e.getBindingResult().getFieldError();
        String message = fieldError != null ? fieldError.getDefaultMessage() : ErrorCode.INVALID_INPUT.getMessage();
        return error(ErrorCode.INVALID_INPUT, message);
    }

    // @RequestParam 등 메서드 파라미터 검증 실패
    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleParamValidation(HandlerMethodValidationException e) {
        String message = e.getAllErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse(ErrorCode.INVALID_INPUT.getMessage());
        return error(ErrorCode.INVALID_INPUT, message);
    }

    // JSON 형식 오류, 없는 enum 값 (예: status = "DONE")
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotReadable(HttpMessageNotReadableException e) {
        return error(ErrorCode.INVALID_INPUT, "요청 본문 형식이 올바르지 않습니다.");
    }

    // 쿼리 파라미터·경로 변수 타입 오류 (예: ?status=DONE, /books/abc)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException e) {
        return error(ErrorCode.INVALID_INPUT, "'" + e.getName() + "' 값이 올바르지 않습니다.");
    }

    // 잘못된 요청 (예: 없는 모집글)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException e) {
        return error(ErrorCode.INVALID_INPUT, e.getMessage());
    }

    // 처리할 수 없는 상태 (예: 모집 마감, 중복 지원)
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalState(IllegalStateException e) {
        return error(ErrorCode.CONFLICT, e.getMessage());
    }

    private ResponseEntity<ApiResponse<Void>> error(ErrorCode code, String message) {
        HttpStatus status = code.getStatus();
        return ResponseEntity.status(status).body(ApiResponse.error(code.name(), message));
    }
}
