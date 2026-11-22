package com.campuslink.campusconnect.domain.bookpost.dto;

// 구매자 후보: 이 판매글로 채팅한 회원 (거래완료 시 구매자 선택용)
public record ChatPartnerResponse(Long userId, String nickname) {
}
