package com.campuslink.campusconnect.domain.projectpost;

import org.springframework.data.jpa.repository.JpaRepository;

// JpaRepository<다룰 엔티티 클래스, 그 엔티티의 PK(ID) 데이터 타입>
public interface ProjectPostRepository extends JpaRepository<ProjectPost, Long> {
    // 여기에 코드를 작성하지 않아도, JpaRepository를 상속받는 순간
    // save(), findById(), findAll(), delete() 같은 기본 CRUD 기능이 자동으로 만들어진다.
}