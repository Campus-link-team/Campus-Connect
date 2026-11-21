package com.campuslink.campusconnect.domain.projectpost.dto;

import com.campuslink.campusconnect.domain.projectpost.ProjectPost;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

// 모집글 목록·상세 응답. 작성자는 엔티티(User) 대신 id와 닉네임만 내려준다 (비밀번호 해시 노출 방지).
@Getter
@AllArgsConstructor
public class ProjectPostResponse {
    private Long id;
    private String title;
    private String content;
    private int capacity;               // 모집 인원
    private int currentApplicantCount;  // 승인된 인원
    private String recruitmentStatus;   // RECRUITING, CLOSED
    private String category;
    private String location;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long writerId;
    private String writerNickname;

    public static ProjectPostResponse from(ProjectPost post) {
        return new ProjectPostResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getCapacity(),
                post.getCurrentApplicantCount(),
                post.getRecruitmentStatus(),
                post.getCategory(),
                post.getLocation(),
                post.getStartDate(),
                post.getEndDate(),
                post.getUser() != null ? post.getUser().getId() : null,
                post.getUser() != null ? post.getUser().getNickname() : null
        );
    }
}
