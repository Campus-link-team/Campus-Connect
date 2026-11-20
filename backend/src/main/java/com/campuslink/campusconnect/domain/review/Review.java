package com.campuslink.campusconnect.domain.review;

import com.campuslink.campusconnect.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id", nullable = false)
    private Long transactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer; // 평가 작성자

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_id", nullable = false)
    private User target; // 평가 대상자

    @Column(nullable = false)
    private int rating; // 1 ~ 5

    @Column(length = 500)
    private String tags; // 쉼표(,)로 구분하여 저장

    @Column(length = 500)
    private String comment;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Review(Long transactionId, User reviewer, User target, int rating, List<String> tagList, String comment) {
        this.transactionId = transactionId;
        this.reviewer = reviewer;
        this.target = target;
        this.rating = rating;
        this.tags = (tagList == null || tagList.isEmpty()) ? "" : String.join(",", tagList);
        this.comment = comment;
        this.createdAt = LocalDateTime.now();
    }

    public List<String> getTagList() {
        if (this.tags == null || this.tags.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.asList(this.tags.split(","));
    }
}