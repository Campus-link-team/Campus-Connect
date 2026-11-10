package com.campuslink.campusconnect.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MyPageResponse {
    private String email;
    private String name;
    private String nickname;
    private String department;

    private int appliedProjectCount; // 지원한 프로젝트 수
    // private int favoriteBookCount; // 나중에 찜 기능과 연동할 때 주석 해제
}