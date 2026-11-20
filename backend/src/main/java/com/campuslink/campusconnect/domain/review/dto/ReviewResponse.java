package com.campuslink.campusconnect.domain.review.dto;

import com.campuslink.campusconnect.domain.review.Review;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ReviewResponse {
    private final Long id;
    private final Long bookPostId;
    private final String bookTitle;
    private final Long reviewerId;
    private final String reviewerName;
    private final Long sellerId;
    private final String sellerName;
    private final int rating;
    private final String comment;
    private final LocalDateTime createdAt;

    public ReviewResponse(Review review) {
        this.id = review.getId();
        this.bookPostId = review.getBookPost().getId();
        this.bookTitle = review.getBookPost().getTitle();
        this.reviewerId = review.getReviewer().getId();
        this.reviewerName = review.getReviewer().getNickname();
        this.sellerId = review.getTarget().getId();
        this.sellerName = review.getTarget().getNickname();
        this.rating = review.getRating();
        this.comment = review.getComment();
        this.createdAt = review.getCreatedAt();
    }
}
