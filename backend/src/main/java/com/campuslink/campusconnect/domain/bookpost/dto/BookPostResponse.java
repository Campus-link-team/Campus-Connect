package com.campuslink.campusconnect.domain.bookpost.dto;

import com.campuslink.campusconnect.domain.bookpost.BookCategory;
import com.campuslink.campusconnect.domain.bookpost.BookPost;
import com.campuslink.campusconnect.domain.bookpost.SaleStatus;
import com.campuslink.campusconnect.domain.user.User;

import java.time.LocalDateTime;

public record BookPostResponse(
        Long id,
        String title,
        String author,
        int price,
        BookCategory category,
        String description,
        String tradePlace,
        SaleStatus status,
        UserSummary seller,
        UserSummary buyer, // 구매자 미지정이면 null
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public record UserSummary(Long id, String nickname) {
        static UserSummary from(User user) {
            return user == null ? null : new UserSummary(user.getId(), user.getNickname());
        }
    }

    public static BookPostResponse from(BookPost post) {
        return new BookPostResponse(
                post.getId(),
                post.getTitle(),
                post.getAuthor(),
                post.getPrice(),
                post.getCategory(),
                post.getDescription(),
                post.getTradePlace(),
                post.getStatus(),
                UserSummary.from(post.getSeller()),
                UserSummary.from(post.getBuyer()),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
