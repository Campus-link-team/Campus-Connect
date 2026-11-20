package com.campuslink.campusconnect.domain.bookpost;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookPostRepository extends JpaRepository<BookPost, Long> {

    // 목록: 카테고리·상태 필터 + 키워드(교재명·저자) 검색
    // 정렬: 판매중 → 예약중 → 거래완료, 같은 상태끼리는 최신순
    @Query("""
            select b from BookPost b join fetch b.seller
            where (:category is null or b.category = :category)
              and (:status is null or b.status = :status)
              and (:keyword is null
                   or lower(b.title) like lower(concat('%', :keyword, '%'))
                   or lower(b.author) like lower(concat('%', :keyword, '%')))
            order by case b.status
                       when com.campuslink.campusconnect.domain.bookpost.SaleStatus.ON_SALE then 0
                       when com.campuslink.campusconnect.domain.bookpost.SaleStatus.RESERVED then 1
                       else 2 end,
                     b.createdAt desc, b.id desc
            """)
    List<BookPost> search(@Param("category") BookCategory category,
                          @Param("status") SaleStatus status,
                          @Param("keyword") String keyword);

    // 구매자로 지정하려는 회원이 이 판매글로 채팅했는지 확인
    // ChatRoom 은 (contextType "BOOK"/"PROJECT", contextId, user1, user2) 구조
    @Query("""
            select count(c) > 0 from ChatRoom c
            where c.contextType = 'BOOK' and c.contextId = :bookPostId
              and (c.user1.id = :userId or c.user2.id = :userId)
            """)
    boolean existsChatWith(@Param("bookPostId") Long bookPostId, @Param("userId") Long userId);

    // 판매글에 채팅방이 있는지
    @Query("select count(c) > 0 from ChatRoom c where c.contextType = 'BOOK' and c.contextId = :bookPostId")
    boolean existsChat(@Param("bookPostId") Long bookPostId);

    // 판매글 삭제 전에 찜 기록 정리 (FK 때문에 먼저 지워야 함)
    @Modifying
    @Query("delete from Favorite f where f.bookPost.id = :bookPostId")
    void deleteFavorites(@Param("bookPostId") Long bookPostId);
}
