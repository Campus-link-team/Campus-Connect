package com.campuslink.campusconnect.domain.bookpost;

import com.campuslink.campusconnect.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

// 중고책 판매글
@Entity
@Table(name = "book_post")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BookPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title; // 교재명

    @Column(nullable = false, length = 50)
    private String author; // 저자

    @Column(nullable = false)
    private int price; // 가격(원)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookCategory category; // 전공 / 교양

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description; // 설명

    @Column(length = 100)
    private String tradePlace; // 거래 희망 장소 (선택)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SaleStatus status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    // SOLD 로 바꿀 때 지정한 구매자. 지정하지 않고 거래완료하면 null (이 경우 후기 없음)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id")
    private User buyer;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public BookPost(String title, String author, int price, BookCategory category,
                    String description, String tradePlace, User seller) {
        this.title = title;
        this.author = author;
        this.price = price;
        this.category = category;
        this.description = description;
        this.tradePlace = tradePlace;
        this.seller = seller;
        this.status = SaleStatus.ON_SALE;
    }

    public boolean isSeller(Long userId) {
        return seller.getId().equals(userId);
    }

    // 부분 수정: null 인 값은 그대로 둠. tradePlace 는 빈 문자열이면 삭제
    public void update(String title, String author, Integer price, BookCategory category,
                       String description, String tradePlace) {
        if (title != null) this.title = title;
        if (author != null) this.author = author;
        if (price != null) this.price = price;
        if (category != null) this.category = category;
        if (description != null) this.description = description;
        if (tradePlace != null) this.tradePlace = tradePlace.isBlank() ? null : tradePlace;
    }

    // 판매중 <-> 예약중
    public void changeStatus(SaleStatus status) {
        this.status = status;
    }

    // 거래완료. buyer 는 null 가능
    public void markSold(User buyer) {
        this.status = SaleStatus.SOLD;
        this.buyer = buyer;
    }
}
