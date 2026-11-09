package com.campuslink.campusconnect.global.security;

import com.campuslink.campusconnect.global.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

// 토큰이 없거나 잘못됐을 때 401 + {"code":"UNAUTHORIZED"|"TOKEN_EXPIRED"} JSON 응답
@Component
public class JsonAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        String message = authException.getMessage();
        ErrorCode code = (message != null && message.toLowerCase().contains("expired"))
                ? ErrorCode.TOKEN_EXPIRED
                : ErrorCode.UNAUTHORIZED;

        response.setStatus(code.getStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(
                "{\"code\":\"" + code.name() + "\",\"message\":\"" + code.getMessage() + "\"}");
    }
}
