package com.campuslink.campusconnect.domain.bookpost;

import com.campuslink.campusconnect.domain.bookpost.dto.BookPostCreateRequest;
import com.campuslink.campusconnect.domain.bookpost.dto.BookPostResponse;
import com.campuslink.campusconnect.domain.bookpost.dto.BookPostUpdateRequest;
import com.campuslink.campusconnect.domain.bookpost.dto.BookStatusUpdateRequest;
import com.campuslink.campusconnect.domain.bookpost.dto.ChatPartnerResponse;
import com.campuslink.campusconnect.domain.chat.ChatRoom;
import com.campuslink.campusconnect.domain.user.User;
import com.campuslink.campusconnect.domain.user.UserRepository;
import com.campuslink.campusconnect.global.exception.BusinessException;
import com.campuslink.campusconnect.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookPostService {

    private final BookPostRepository bookPostRepository;
    private final UserRepository userRepository;

    @Transactional
    public BookPostResponse create(Long loginUserId, BookPostCreateRequest request) {
        User seller = userRepository.findById(loginUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));

        BookPost post = new BookPost(
                request.title().trim(),
                request.author().trim(),
                request.price(),
                request.category(),
                request.description(),
                blankToNull(request.tradePlace()),
                seller);
        return BookPostResponse.from(bookPostRepository.saveAndFlush(post));
    }

    public List<BookPostResponse> getList(BookCategory category, SaleStatus status, String keyword) {
        return bookPostRepository.search(category, status, blankToNull(keyword)).stream()
                .map(BookPostResponse::from)
                .toList();
    }

    public BookPostResponse get(Long bookPostId) {
        return BookPostResponse.from(findPost(bookPostId));
    }

    @Transactional
    public BookPostResponse update(Long loginUserId, Long bookPostId, BookPostUpdateRequest request) {
        BookPost post = findOwnPost(loginUserId, bookPostId);
        post.update(
                trimOrNull(request.title()),
                trimOrNull(request.author()),
                request.price(),
                request.category(),
                request.description(),
                trimOrNull(request.tradePlace()));
        bookPostRepository.flush(); // updatedAt 반영 후 응답
        return BookPostResponse.from(post);
    }

    @Transactional
    public void delete(Long loginUserId, Long bookPostId) {
        BookPost post = findOwnPost(loginUserId, bookPostId);
        // 채팅방이 판매글 id(contextId)를 참조하므로, 채팅 기록 보존을 위해 채팅이 있으면 삭제하지 않음
        if (bookPostRepository.existsChat(bookPostId)) {
            throw new BusinessException(ErrorCode.BOOK_POST_HAS_CHAT);
        }
        bookPostRepository.deleteFavorites(bookPostId);
        bookPostRepository.delete(post);
    }

    @Transactional
    public BookPostResponse changeStatus(Long loginUserId, Long bookPostId, BookStatusUpdateRequest request) {
        BookPost post = findOwnPost(loginUserId, bookPostId);

        // 거래완료는 최종 상태 (거래 완료된 책이 다시 판매중으로 보이지 않도록)
        if (post.getStatus() == SaleStatus.SOLD) {
            throw new BusinessException(ErrorCode.ALREADY_SOLD);
        }

        if (request.status() == SaleStatus.SOLD) {
            post.markSold(resolveBuyer(post, request.buyerId()));
        } else {
            if (request.buyerId() != null) {
                throw new BusinessException(ErrorCode.INVALID_INPUT, "구매자는 SOLD 로 변경할 때만 지정할 수 있습니다.");
            }
            post.changeStatus(request.status());
        }
        bookPostRepository.flush();
        return BookPostResponse.from(post);
    }

    // 구매자 후보: 이 판매글로 채팅한 회원 목록 (작성자만 조회, 판매자 본인 제외)
    public List<ChatPartnerResponse> getChatPartners(Long loginUserId, Long bookPostId) {
        BookPost post = findOwnPost(loginUserId, bookPostId);
        Map<Long, ChatPartnerResponse> partners = new LinkedHashMap<>();
        for (ChatRoom room : bookPostRepository.findBookChatRooms(post.getId())) {
            User opponent = room.getOpponent(loginUserId);
            if (!post.isSeller(opponent.getId())) {
                partners.putIfAbsent(opponent.getId(), new ChatPartnerResponse(opponent.getId(), opponent.getNickname()));
            }
        }
        return List.copyOf(partners.values());
    }

    // 내 판매글 목록 (마이페이지)
    public List<BookPostResponse> getMine(Long loginUserId) {
        return bookPostRepository.findMine(loginUserId).stream()
                .map(BookPostResponse::from)
                .toList();
    }

    // buyerId 가 없으면 구매자 없이 거래완료, 있으면 이 판매글로 채팅한 회원인지 확인
    private User resolveBuyer(BookPost post, Long buyerId) {
        if (buyerId == null) {
            return null;
        }
        if (post.isSeller(buyerId) || !bookPostRepository.existsChatWith(post.getId(), buyerId)) {
            throw new BusinessException(ErrorCode.INVALID_BUYER);
        }
        return userRepository.findById(buyerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_BUYER));
    }

    private BookPost findPost(Long bookPostId) {
        return bookPostRepository.findById(bookPostId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOOK_POST_NOT_FOUND));
    }

    private BookPost findOwnPost(Long loginUserId, Long bookPostId) {
        BookPost post = findPost(bookPostId);
        if (!post.isSeller(loginUserId)) {
            throw new BusinessException(ErrorCode.NOT_BOOK_POST_OWNER);
        }
        return post;
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    private static String trimOrNull(String s) {
        return s == null ? null : s.trim();
    }
}
