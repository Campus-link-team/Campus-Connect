package com.campuslink.campusconnect.domain.bookpost;

// 판매 상태는 세 가지로 고정
public enum SaleStatus {
    ON_SALE,   // 판매중
    RESERVED,  // 예약중
    SOLD       // 거래완료 (되돌릴 수 없음)
}
