package com.campuslink.campusconnect.domain.bookpost.dto;

import com.campuslink.campusconnect.domain.bookpost.BookCategory;
import jakarta.validation.constraints.*;

public record BookPostCreateRequest(
        @NotBlank(message = "교재명을 입력해 주세요.")
        @Size(max = 100, message = "교재명은 100자 이하여야 합니다.")
        String title,

        @NotBlank(message = "저자를 입력해 주세요.")
        @Size(max = 50, message = "저자는 50자 이하여야 합니다.")
        String author,

        @NotNull(message = "가격을 입력해 주세요.")
        @PositiveOrZero(message = "가격은 0원 이상이어야 합니다.")
        @Max(value = 10_000_000, message = "가격이 너무 큽니다.")
        Integer price,

        @NotNull(message = "카테고리(MAJOR/GENERAL)를 선택해 주세요.")
        BookCategory category,

        @NotBlank(message = "설명을 입력해 주세요.")
        @Size(max = 2000, message = "설명은 2000자 이하여야 합니다.")
        String description,

        @Size(max = 100, message = "거래 희망 장소는 100자 이하여야 합니다.")
        String tradePlace // 선택
) {
}
