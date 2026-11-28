package com.campuslink.campusconnect.domain.projectpost;

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
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// 로컬 MySQL(campus_connect)을 사용하며, @Transactional 로 테스트 데이터는 롤백됩니다.
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ProjectPostApiTest {

    @Autowired MockMvc mockMvc;
    @Autowired JwtEncoder jwtEncoder;
    @Autowired UserRepository userRepository;
    @Autowired ProjectPostRepository projectPostRepository;

    User writer;
    User applicant;
    User other;
    ProjectPost post;

    @BeforeEach
    void setUp() {
        writer = userRepository.save(new User("writer@syu.ac.kr", "pw", "작성자T"));
        applicant = userRepository.save(new User("applicant@syu.ac.kr", "pw", "지원자T"));
        other = userRepository.save(new User("other@syu.ac.kr", "pw", "다른회원T"));
        post = projectPostRepository.save(new ProjectPost("캡스톤 팀원 모집", "백엔드 1명 구해요", 2, "팀플", "온라인", writer));
    }

    private String token(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(user.getId().toString()).issuedAt(now).expiresAt(now.plusSeconds(600)).build();
        return "Bearer " + jwtEncoder.encode(
                JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
    }

    @Test
    void 상세_조회는_작성자_닉네임만_내려주고_비밀번호는_없다() throws Exception {
        mockMvc.perform(get("/api/v1/projects/" + post.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("캡스톤 팀원 모집"))
                .andExpect(jsonPath("$.data.content").value("백엔드 1명 구해요"))
                .andExpect(jsonPath("$.data.capacity").value(2))
                .andExpect(jsonPath("$.data.recruitmentStatus").value("RECRUITING"))
                .andExpect(jsonPath("$.data.writerNickname").value("작성자T"))
                .andExpect(jsonPath("$.data.user").doesNotExist())
                .andExpect(content().string(not(containsString("password"))));
    }

    @Test
    void 작성자가_아니면_수정과_삭제는_403() throws Exception {
        String body = """
                {"title":"바꾼 제목","content":"바꾼 내용","capacity":3,"category":"팀플","location":"온라인"}
                """;
        mockMvc.perform(patch("/api/v1/projects/" + post.getId()).header("Authorization", token(other))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("FORBIDDEN"));

        mockMvc.perform(delete("/api/v1/projects/" + post.getId()).header("Authorization", token(other)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("FORBIDDEN"));

        mockMvc.perform(patch("/api/v1/projects/" + post.getId()).header("Authorization", token(writer))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk());
    }

    @Test
    void 지원자_목록은_작성자만_볼_수_있다() throws Exception {
        mockMvc.perform(post("/api/v1/projects/" + post.getId() + "/applications").header("Authorization", token(applicant))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"roleName\":\"백엔드\",\"introduction\":\"열심히 하겠습니다\"}"))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/projects/" + post.getId() + "/applications").header("Authorization", token(writer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].applicantNickname").value("지원자T"))
                .andExpect(jsonPath("$.data[0].roleName").value("백엔드"))
                .andExpect(jsonPath("$.data[0].status").value("PENDING"));

        mockMvc.perform(get("/api/v1/projects/" + post.getId() + "/applications").header("Authorization", token(other)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("FORBIDDEN"));
    }

    @Test
    void 작성자가_아니면_승인은_403() throws Exception {
        mockMvc.perform(post("/api/v1/projects/" + post.getId() + "/applications").header("Authorization", token(applicant))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"roleName\":\"백엔드\",\"introduction\":\"지원합니다\"}"))
                .andExpect(status().isCreated());
        String applicationsJson = mockMvc.perform(get("/api/v1/projects/" + post.getId() + "/applications")
                        .header("Authorization", token(writer)))
                .andReturn().getResponse().getContentAsString();
        String applicationId = applicationsJson.replaceAll("(?s).*\"applicationId\":(\\d+).*", "$1");

        mockMvc.perform(patch("/api/v1/projects/" + post.getId() + "/applications/" + applicationId)
                        .header("Authorization", token(other))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"APPROVED\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void 마이페이지_내_모집글과_지원_내역() throws Exception {
        mockMvc.perform(post("/api/v1/projects/" + post.getId() + "/applications").header("Authorization", token(applicant))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"roleName\":\"백엔드\",\"introduction\":\"지원합니다\"}"))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/users/me/projects").header("Authorization", token(writer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].title").value("캡스톤 팀원 모집"));

        mockMvc.perform(get("/api/v1/users/me/applications").header("Authorization", token(applicant)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].projectTitle").value("캡스톤 팀원 모집"))
                .andExpect(jsonPath("$.data[0].status").value("PENDING"));

        mockMvc.perform(get("/api/v1/users/me/applications").header("Authorization", token(other)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    void 모집글_등록과_수정에_마감일이_저장되고_지난_날짜는_400() throws Exception {
        String end = LocalDate.now().plusDays(7).toString();
        mockMvc.perform(post("/api/v1/projects").header("Authorization", token(other))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"마감일 테스트\",\"content\":\"내용\",\"capacity\":2,\"category\":\"개발\",\"location\":\"온라인\",\"startDate\":\"" + end + "\",\"endDate\":\"" + end + "\"}"))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/users/me/projects").header("Authorization", token(other)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].endDate").value(end))
                .andExpect(jsonPath("$.data[0].startDate").value(end));

        String past = LocalDate.now().minusDays(1).toString();
        mockMvc.perform(post("/api/v1/projects").header("Authorization", token(other))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"지난 날짜\",\"content\":\"내용\",\"capacity\":2,\"category\":\"개발\",\"endDate\":\"" + past + "\"}"))
                .andExpect(status().isBadRequest());

        String later = LocalDate.now().plusDays(14).toString();
        mockMvc.perform(patch("/api/v1/projects/" + post.getId()).header("Authorization", token(writer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"캡스톤 팀원 모집\",\"content\":\"백엔드 1명 구해요\",\"capacity\":2,\"category\":\"팀플\",\"location\":\"온라인\",\"endDate\":\"" + later + "\"}"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/projects/" + post.getId()))
                .andExpect(jsonPath("$.data.endDate").value(later));
    }
}
