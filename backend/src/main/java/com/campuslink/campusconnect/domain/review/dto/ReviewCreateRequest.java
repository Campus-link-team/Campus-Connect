package com.campuslink.campusconnect.domain.review.dto;

import lombok.Getter;

@Getter
public class ReviewCreateRequest {
    private Integer rating;
    private String comment;
}
