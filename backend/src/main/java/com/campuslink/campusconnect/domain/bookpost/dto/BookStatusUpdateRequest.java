package com.campuslink.campusconnect.domain.bookpost.dto;

import com.campuslink.campusconnect.domain.bookpost.SaleStatus;
import jakarta.validation.constraints.NotNull;

// buyerId 는 SOLD 일 때만 선택적으로 사용
//  - 넣으면: 해당 판매글로 채팅한 회원인지 확인 후 구매자로 지정
//  - 안 넣으면: 구매자 없이 거래완료 (후기 작성 불가)
public record BookStatusUpdateRequest(
        @NotNull(message = "변경할 판매 상태(ON_SALE/RESERVED/SOLD)를 입력해 주세요.")
        SaleStatus status,
        Long buyerId
) {
}
