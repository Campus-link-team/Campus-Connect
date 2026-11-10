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

    // 비관적 락(Pessimistic Lock)을 사용하여 선착순 동시성 문제를 해결하는 메서드
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from ProjectPost p where p.id = :id")
    Optional<ProjectPost> findByIdWithPessimisticLock(@Param("id") Long id);
}
