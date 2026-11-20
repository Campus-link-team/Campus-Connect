package com.campuslink.campusconnect.domain.review.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MannerSummaryResponse {
    private Long userId;
    private double averageRating;
    private long reviewCount;
    private double mannerTemperature;
}