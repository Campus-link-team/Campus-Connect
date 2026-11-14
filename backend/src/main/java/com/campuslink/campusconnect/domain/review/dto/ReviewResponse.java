package com.campuslink.campusconnect.domain.review.dto;

import com.campuslink.campusconnect.domain.review.Review;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
public class ReviewResponse {
    private final Long id;
    private final Long transactionId;
    private final Long reviewerId;
    private final String reviewerName;
    private final int rating;
    private final List<String> tags;
    private final String comment;
    private final LocalDateTime createdAt;

    public ReviewResponse(Review review) {
        this.id = review.getId();
        this.transactionId = review.getTransactionId();
        this.reviewerId = review.getReviewer().getId();
        this.reviewerName = review.getReviewer().getName();
        this.rating = review.getRating();
        this.tags = review.getTagList();
        this.comment = review.getComment();
        this.createdAt = review.getCreatedAt();
    }
}