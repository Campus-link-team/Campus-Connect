package com.campuslink.campusconnect.domain.review.dto;

import lombok.Getter;
import java.util.List;

@Getter
public class ReviewCreateRequest {
    private Long targetUserId; // 추후 Transaction 엔티티 연동 시 거래 데이터에서 자동 추출로 교체
    private Integer rating;
    private List<String> tags;
    private String comment;
}