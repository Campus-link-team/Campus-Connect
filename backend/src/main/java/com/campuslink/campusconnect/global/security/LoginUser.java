package com.campuslink.campusconnect.global.security;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.lang.annotation.*;

/**
 * 컨트롤러에서 로그인한 사용자의 id(Long)를 바로 받는 어노테이션.
 * 예) public X create(@LoginUser Long userId, ...)
 * JWT의 subject(사용자 id)를 Long으로 변환해 넣어줍니다.
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@AuthenticationPrincipal(expression = "T(java.lang.Long).valueOf(subject)")
public @interface LoginUser {
}
