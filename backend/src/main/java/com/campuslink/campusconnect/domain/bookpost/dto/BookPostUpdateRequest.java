package com.campuslink.campusconnect.domain.bookpost.dto;

import com.campuslink.campusconnect.domain.bookpost.BookCategory;
import jakarta.validation.constraints.*;

// PATCH: 보낸 필드만 수정. tradePlace 는 "" 로 보내면 삭제
// 판매 상태는 여기서 바꾸지 않고 PATCH /api/v1/books/{id}/status 사용
public record BookPostUpdateRequest(
        @Pattern(regexp = "(?s).*\\S.*", message = "교재명은 비워 둘 수 없습니다.")
        @Size(max = 100, message = "교재명은 100자 이하여야 합니다.")
        String title,

        @Pattern(regexp = "(?s).*\\S.*", message = "저자는 비워 둘 수 없습니다.")
        @Size(max = 50, message = "저자는 50자 이하여야 합니다.")
        String author,

        @PositiveOrZero(message = "가격은 0원 이상이어야 합니다.")
        @Max(value = 10_000_000, message = "가격이 너무 큽니다.")
        Integer price,

        BookCategory category,

        @Pattern(regexp = "(?s).*\\S.*", message = "설명은 비워 둘 수 없습니다.")
        @Size(max = 2000, message = "설명은 2000자 이하여야 합니다.")
        String description,

        @Size(max = 100, message = "거래 희망 장소는 100자 이하여야 합니다.")
        String tradePlace
) {
}
