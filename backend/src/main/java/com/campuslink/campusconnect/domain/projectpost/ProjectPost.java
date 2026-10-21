package com.campuslink.campusconnect.domain.projectpost;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate; //날짜를 다루기 위해 필요함

@NoArgsConstructor(access = AccessLevel.PROTECTED) //매개변수가 없는 기본 생성자를 자동으로 만들어줌.
@AllArgsConstructor //클래스에 존재하는 모든 필드를 매개변수로 받는 생성자를 자동으로 만들어줌.
@Getter //클래스의 모든 필드에 대해 값을 읽어올 수 있는 getId(), getCapacity() 등의 Getter 메서드를 자동으로 만들어줌.
@Entity //이 클래스가 데이터베이스의 테이블과 1:1로 매핑되는 JPA 엔티티 객체임을 스프링(JPA)에 알려줌.
@Builder //복잡한 객체 생성을 도와주는 빌더 패턴(Builder Pattern)을 코드가 아닌 어노테이션 하나로 자동 생성해 주는 기능

public class ProjectPost {
    @Id //이 필드가 테이블의 기본 키(PK)임을 나타냄.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 기본 키 값의 생성을 데이터베이스에 위임
    @Column(name = "id", updatable = false) //DB의 id 컬럼과 매핑되며, updatable = false를 통해 한 번 생성된 id 값은 절대 수정할 수 없도록 안전하게 막았음.
    private Long id; //ERD에 bigint를 사용하라고 명시되었으므로, Long 타입을 사용하였음.

    @Column(name = "title", nullable = false) //nullable = false를 주어 이 값은 반드시 존재해야 함(NOT NULL)을 명시했음.
    private String title; //제목

    @Column(name = "content")
    private String content; //내용

    @Column(name = "capacity", nullable = false)
    private int capacity; //최대 수용 가능 인원

    @Column(name = "recruitment_status", nullable = false)
    private String recruitmentStatus; // 현재 인원 모집 상태 알려줌.(초기값: "모집중")

    @Column(name = "current_applicant_count", nullable = false)
    private int currentApplicantCount = 0; // 현재 지원자 수 (초기값: 0명)

    @Column(name = "category")
    private String category; // 스터디, 동아리, 팀플 등

    @Column(name = "start_date")
    private LocalDate startDate; // 모집(활동) 시작일

    @Column(name = "end_date")
    private LocalDate endDate; // 모집(활동) 종료일

    @Column(name = "location")
    private String location; // 활동 장소

    @Column(name = "qualifications")
    private String qualifications; // 지원 자격

    @Column(name = "tags")
    private String tags; // 키워드 (예: "#웹개발,#프로젝트" 형태로 쉼표로 구분해서 저장)

    public void updatePost(String title, String content, int capacity, String category, String location) {
        this.title = title;
        this.content = content;
        this.capacity = capacity;
        this.category = category;
        this.location = location;
}
//나중에 User 엔티티를 만들고 나서, 이 엔티티와 연관시켜야 한다. "누가 이 글을 썼는지" 식별하기 위해 User 객체를 참조하는 필드가 추가로 필요함.
}