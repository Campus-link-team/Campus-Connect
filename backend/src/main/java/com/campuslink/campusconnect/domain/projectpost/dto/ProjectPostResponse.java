package com.campuslink.campusconnect.domain.projectpost.dto;

import com.campuslink.campusconnect.domain.user.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProjectPostResponse {
    private Long id;          // 프로젝트 고유 번호
    private String title;     // 프로젝트 제목
    private User user;        // 작성자 정보 (나중에 프론트엔드 요구사항에 맞춰 이름(String)만 주도록 바꿀 수도 있습니다)
    private String startDate; // 프로젝트 시작 날짜 (문자열 형태)

    // 만약 예전에 다른 필드(예: content 등)를 하나만 선언해두셨다면,
    // 그 필드를 지우고 위 4개의 필드로 통일해주시면 됩니다.
}