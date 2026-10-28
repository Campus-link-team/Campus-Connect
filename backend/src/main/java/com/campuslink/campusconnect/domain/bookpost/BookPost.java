package com.campuslink.campusconnect.domain.bookpost;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;

@Entity
@Getter
public class BookPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 제목, 가격, 카테고리 등 실제 필드들은 동료 백엔드 개발자가 나중에 채워 넣을 예정입니다.
}