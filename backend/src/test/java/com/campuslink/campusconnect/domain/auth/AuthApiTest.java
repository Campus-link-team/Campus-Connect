package com.campuslink.campusconnect.domain.auth;

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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// 로컬 MySQL(campus_connect)을 사용하며, @Transactional 로 테스트 데이터는 롤백됩니다.
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthApiTest {

    private static final String SIGNUP_BODY =
            "{\"email\":\"Test@syu.ac.kr\",\"password\":\"abcd1234!\",\"nickname\":\"테스터\"}";

    @Autowired
    MockMvc mockMvc;

    @Autowired
    JwtEncoder jwtEncoder;

    @Test
    void 회원가입_로그인_내정보조회() throws Exception {
        mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON).content(SIGNUP_BODY))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("test@syu.ac.kr"))
                .andExpect(jsonPath("$.nickname").value("테스터"));

        MvcResult login = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"test@syu.ac.kr\",\"password\":\"abcd1234!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(3600))
                .andReturn();

        Matcher m = Pattern.compile("\"accessToken\":\"([^\"]+)\"").matcher(login.getResponse().getContentAsString());
        m.find();
        String token = m.group(1);

        mockMvc.perform(get("/api/users/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@syu.ac.kr"))
                .andExpect(jsonPath("$.createdAt").exists());
    }

    @Test
    void 중복_이메일과_닉네임은_409() throws Exception {
        mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON).content(SIGNUP_BODY))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON).content(SIGNUP_BODY))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_EXISTS"));

        mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"other@syu.ac.kr\",\"password\":\"abcd1234!\",\"nickname\":\"테스터\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("NICKNAME_ALREADY_EXISTS"));

        mockMvc.perform(get("/api/auth/nickname/check").param("nickname", "테스터"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));
    }

    @Test
    void 비밀번호_규칙_위반은_400() throws Exception {
        mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"a@syu.ac.kr\",\"password\":\"12345678\",\"nickname\":\"닉네임\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT"));

        mockMvc.perform(get("/api/auth/nickname/check").param("nickname", "a"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT"));
    }

    @Test
    void 틀린_비밀번호는_LOGIN_FAILED() throws Exception {
        mockMvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON).content(SIGNUP_BODY))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"test@syu.ac.kr\",\"password\":\"wrong1234!\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("LOGIN_FAILED"));
    }

    @Test
    void 토큰없이_내정보조회는_401() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        mockMvc.perform(get("/api/users/me").header("Authorization", "Bearer invalid.token.value"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void 만료된_토큰은_TOKEN_EXPIRED() throws Exception {
        // 기본 허용 오차(60초)보다 오래 전에 만료된 토큰
        Instant past = Instant.now().minusSeconds(600);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject("1").issuedAt(past).expiresAt(past.plusSeconds(60)).build();
        String expired = jwtEncoder.encode(
                JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();

        mockMvc.perform(get("/api/users/me").header("Authorization", "Bearer " + expired))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("TOKEN_EXPIRED"));
    }
}
