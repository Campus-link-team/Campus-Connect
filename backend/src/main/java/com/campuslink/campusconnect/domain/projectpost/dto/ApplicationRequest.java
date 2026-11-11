package com.campuslink.campusconnect.domain.projectpost.dto;

import lombok.Getter;

@Getter
public class ApplicationRequest {
    // 프론트엔드 명세서에 맞춰 필드명을 정확히 일치시킵니다.
    private String roleName;     // 예: "프론트엔드", "백엔드"
    private String introduction; // 자기소개 및 지원 동기 텍스트
}