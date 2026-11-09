package com.campuslink.campusconnect.global.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

// application.yml 의 jwt.* 값
@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(String secret, long expirationSeconds) {
}
