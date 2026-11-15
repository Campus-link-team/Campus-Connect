package com.campuslink.campusconnect.domain.projectpost.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

// 클라이언트(포스트맨)에서 보내는 JSON 데이터를 담는 바구니 역할
@Getter
@NoArgsConstructor
public class ProjectPostDto {

    private String title;
    private String content;
    private int capacity;
    private String category;
    private String location;

    // 만약 에러가 계속 난다면 AllArgsConstructor를 추가해 보세요.
    public ProjectPostDto(String title, String content, int capacity, String category, String location) {
        this.title = title;
        this.content = content;
        this.capacity = capacity;
        this.category = category;
        this.location = location;
    }
}