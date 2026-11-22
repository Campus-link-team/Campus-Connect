package com.campuslink.campusconnect.domain.bookpost;

import com.campuslink.campusconnect.domain.chat.ChatRoom;
import com.campuslink.campusconnect.domain.chat.ChatRoomRepository;
import com.campuslink.campusconnect.domain.user.User;
import com.campuslink.campusconnect.domain.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// 로컬 MySQL(campus_connect)을 사용하며, @Transactional 로 테스트 데이터는 롤백됩니다.
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class BookPostApiTest {

    @Autowired MockMvc mockMvc;
    @Autowired JwtEncoder jwtEncoder;
    @Autowired UserRepository userRepository;
    @Autowired BookPostRepository bookPostRepository;
    @Autowired ChatRoomRepository chatRoomRepository;

    User seller;
    User buyer;
    User other;

    @BeforeEach
    void setUp() {
        seller = userRepository.save(new User("seller@syu.ac.kr", "pw", "판매자T"));
        buyer = userRepository.save(new User("buyer@syu.ac.kr", "pw", "구매자T"));
        other = userRepository.save(new User("other@syu.ac.kr", "pw", "다른회원T"));
    }

    private String token(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(user.getId().toString()).issuedAt(now).expiresAt(now.plusSeconds(600)).build();
        return "Bearer " + jwtEncoder.encode(
                JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
    }

    private ResultActions createBook(User user, String title, String author, String category) throws Exception {
        String body = """
                {"title":"%s","author":"%s","price":15000,"category":"%s",
                 "description":"필기 조금 있어요","tradePlace":"중앙도서관 앞"}
                """.formatted(title, author, category);
        return mockMvc.perform(post("/api/v1/books").header("Authorization", token(user))
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private long createBookId(User user, String title, String author, String category) throws Exception {
        String json = createBook(user, title, author, category).andReturn().getResponse().getContentAsString();
        Matcher m = Pattern.compile("\"id\":(\\d+)").matcher(json);
        m.find();
        return Long.parseLong(m.group(1));
    }

    private ResultActions changeStatus(User user, long bookId, String body) throws Exception {
        return mockMvc.perform(patch("/api/v1/books/" + bookId + "/status").header("Authorization", token(user))
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    @Test
    void 등록하면_판매중으로_생성되고_조회된다() throws Exception {
        createBook(seller, "자료구조", "홍길동", "MAJOR")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("ON_SALE"))
                .andExpect(jsonPath("$.data.category").value("MAJOR"))
                .andExpect(jsonPath("$.data.tradePlace").value("중앙도서관 앞"))
                .andExpect(jsonPath("$.data.seller.nickname").value("판매자T"))
                .andExpect(jsonPath("$.data.buyer").doesNotExist())
                .andExpect(jsonPath("$.error").doesNotExist());

        long id = createBookId(seller, "운영체제", "김철수", "MAJOR");
        mockMvc.perform(get("/api/v1/books/" + id).header("Authorization", token(other)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("운영체제"));
    }

    @Test
    void 필수값이_없거나_잘못되면_400() throws Exception {
        mockMvc.perform(post("/api/v1/books").header("Authorization", token(seller))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"\",\"author\":\"a\",\"price\":1000,\"category\":\"MAJOR\",\"description\":\"d\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.data").doesNotExist())
                .andExpect(jsonPath("$.error.code").value("INVALID_INPUT"));

        // 없는 카테고리 값
        createBook(seller, "자료구조", "홍길동", "ETC")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("INVALID_INPUT"));

        // 로그인 없이 등록
        mockMvc.perform(post("/api/v1/books").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @Test
    void 수정은_PATCH로_보낸_필드만_바뀌고_작성자만_가능() throws Exception {
        long id = createBookId(seller, "자료구조", "홍길동", "MAJOR");

        mockMvc.perform(patch("/api/v1/books/" + id).header("Authorization", token(seller))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"price\":9000,\"tradePlace\":\"\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.price").value(9000))
                .andExpect(jsonPath("$.data.title").value("자료구조"))
                .andExpect(jsonPath("$.data.tradePlace").doesNotExist());

        mockMvc.perform(patch("/api/v1/books/" + id).header("Authorization", token(other))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"price\":1}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("NOT_BOOK_POST_OWNER"));
    }

    @Test
    void 삭제는_작성자만_가능() throws Exception {
        long id = createBookId(seller, "자료구조", "홍길동", "MAJOR");

        mockMvc.perform(delete("/api/v1/books/" + id).header("Authorization", token(other)))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/v1/books/" + id).header("Authorization", token(seller)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/books/" + id).header("Authorization", token(seller)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("BOOK_POST_NOT_FOUND"));
    }

    @Test
    void SOLD_구매자_지정은_채팅한_회원만_가능() throws Exception {
        long id = createBookId(seller, "자료구조", "홍길동", "MAJOR");
        chatRoomRepository.save(new ChatRoom("BOOK", id, buyer, seller));

        // 채팅하지 않은 회원은 구매자로 지정 불가
        changeStatus(seller, id, "{\"status\":\"SOLD\",\"buyerId\":" + other.getId() + "}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("INVALID_BUYER"));

        // 작성자가 아니면 상태 변경 불가
        changeStatus(buyer, id, "{\"status\":\"RESERVED\"}")
                .andExpect(status().isForbidden());

        changeStatus(seller, id, "{\"status\":\"RESERVED\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("RESERVED"));

        changeStatus(seller, id, "{\"status\":\"SOLD\",\"buyerId\":" + buyer.getId() + "}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SOLD"))
                .andExpect(jsonPath("$.data.buyer.id").value(buyer.getId()));

        // 거래완료 후에는 상태 변경 불가
        changeStatus(seller, id, "{\"status\":\"ON_SALE\"}")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("ALREADY_SOLD"));
    }

    @Test
    void SOLD_구매자_없이_거래완료_가능() throws Exception {
        long id = createBookId(seller, "자료구조", "홍길동", "MAJOR");

        changeStatus(seller, id, "{\"status\":\"SOLD\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SOLD"))
                .andExpect(jsonPath("$.data.buyer").doesNotExist());
    }

    @Test
    void 판매상태값은_세가지만_허용() throws Exception {
        long id = createBookId(seller, "자료구조", "홍길동", "MAJOR");

        changeStatus(seller, id, "{\"status\":\"DONE\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("INVALID_INPUT"));

        // SOLD 가 아닐 때 buyerId 는 받지 않음
        changeStatus(seller, id, "{\"status\":\"RESERVED\",\"buyerId\":" + buyer.getId() + "}")
                .andExpect(status().isBadRequest());
    }

    @Test
    void 목록은_필터_키워드_판매중우선_최신순() throws Exception {
        // 기존 DB 데이터와 섞이지 않도록 모든 글에 QX7 표시를 넣고 keyword 로 범위를 좁힘
        long sold = createBookId(seller, "QX7자료구조 입문", "홍QX7", "MAJOR");
        long onSaleOld = createBookId(seller, "QX7자료구조 심화", "이몽룡", "MAJOR");
        long general = createBookId(seller, "QX7글쓰기의 기초", "성춘향", "GENERAL");
        long onSaleNew = createBookId(seller, "QX7알고리즘", "홍QX7", "MAJOR");
        changeStatus(seller, sold, "{\"status\":\"SOLD\"}").andExpect(status().isOk());

        String auth = token(other);

        // 판매중이 먼저(최신순), 거래완료는 뒤
        mockMvc.perform(get("/api/v1/books").header("Authorization", auth)
                        .param("keyword", "qx7").param("category", "MAJOR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(3)))
                .andExpect(jsonPath("$.data[0].id").value(onSaleNew))
                .andExpect(jsonPath("$.data[1].id").value(onSaleOld))
                .andExpect(jsonPath("$.data[2].id").value(sold));

        mockMvc.perform(get("/api/v1/books").header("Authorization", auth)
                        .param("keyword", "QX7").param("category", "GENERAL"))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(general));

        mockMvc.perform(get("/api/v1/books").header("Authorization", auth)
                        .param("keyword", "QX7").param("status", "SOLD"))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(sold));

        // 키워드: 교재명 또는 저자
        mockMvc.perform(get("/api/v1/books").header("Authorization", auth).param("keyword", "QX7자료구조"))
                .andExpect(jsonPath("$.data", hasSize(2)));
        mockMvc.perform(get("/api/v1/books").header("Authorization", auth).param("keyword", "홍QX7"))
                .andExpect(jsonPath("$.data", hasSize(2)));
        mockMvc.perform(get("/api/v1/books").header("Authorization", auth)
                        .param("keyword", "홍QX7").param("status", "ON_SALE"))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(onSaleNew));

        mockMvc.perform(get("/api/v1/books").header("Authorization", auth).param("status", "DONE"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("INVALID_INPUT"));
    }

    @Test
    void 판매글_목록과_상세는_로그인_없이_볼_수_있다() throws Exception {
        long id = createBookId(seller, "자료구조", "홍길동", "MAJOR");

        mockMvc.perform(get("/api/v1/books"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/books/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("자료구조"));
    }

    @Test
    void 구매자_후보는_채팅한_회원이고_작성자만_볼_수_있다() throws Exception {
        long id = createBookId(seller, "자료구조", "홍길동", "MAJOR");
        chatRoomRepository.save(new ChatRoom("BOOK", id, buyer, seller));

        mockMvc.perform(get("/api/v1/books/" + id + "/chat-partners").header("Authorization", token(seller)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].userId").value(buyer.getId()))
                .andExpect(jsonPath("$.data[0].nickname").value("구매자T"));

        mockMvc.perform(get("/api/v1/books/" + id + "/chat-partners").header("Authorization", token(other)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/books/" + id + "/chat-partners"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void 내_판매글_목록에는_내_글만_나온다() throws Exception {
        createBookId(seller, "자료구조", "홍길동", "MAJOR");
        createBookId(seller, "운영체제", "김철수", "MAJOR");
        createBookId(other, "경제학원론", "이영희", "GENERAL");

        mockMvc.perform(get("/api/v1/users/me/books").header("Authorization", token(seller)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)));
    }

    @Test
    void 마이페이지_찜_목록에는_내가_찜한_글만_나온다() throws Exception {
        long id = createBookId(seller, "자료구조", "홍길동", "MAJOR");
        createBookId(seller, "운영체제", "김철수", "MAJOR");

        mockMvc.perform(post("/api/v1/books/" + id + "/favorite").header("Authorization", token(buyer)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/users/me/favorites").header("Authorization", token(buyer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].title").value("자료구조"));
    }
}
