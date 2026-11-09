package com.campuslink.campusconnect.domain.projectpost;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

// JpaRepository<다룰 엔티티 클래스, 그 엔티티의 PK(ID) 데이터 타입>
public interface ProjectPostRepository extends JpaRepository<ProjectPost, Long> {
    // 여기에 코드를 작성하지 않아도, JpaRepository를 상속받는 순간
    // save(), findById(), findAll(), delete() 같은 기본 CRUD 기능이 자동으로 만들어진다.

    // 선착순 지원 시 동시에 여러 명이 지원해도 정원을 넘지 않도록 비관적 락(SELECT ... FOR UPDATE)으로 조회
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from ProjectPost p where p.id = :id")
    Optional<ProjectPost> findByIdWithPessimisticLock(@Param("id") Long id);
}
