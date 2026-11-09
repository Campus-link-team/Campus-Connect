package com.campuslink.campusconnect.domain.projectpost.dto;

import com.campuslink.campusconnect.domain.projectpost.ProjectPost;
import lombok.Getter;
import java.time.LocalDate;

// 게시글의 모든 정보(id, 상태, 현재 인원 포함)를 담아 프론트엔드로 전달할 객체
@Getter
public class ProjectPostResponse {
    private Long id;
    private String title;
    private String content;
    private int capacity;
    private String recruitmentStatus;
    private int currentApplicantCount;
    private String category;
    private LocalDate startDate;
    private LocalDate endDate;
    private String location;
    private String qualifications;
    private String tags;

    // Entity를 받아서 DTO로 변환해 주는 생성자
    public ProjectPostResponse(ProjectPost post) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.capacity = post.getCapacity();
        this.recruitmentStatus = post.getRecruitmentStatus();
        this.currentApplicantCount = post.getCurrentApplicantCount();
        this.category = post.getCategory();
        this.startDate = post.getStartDate();
        this.endDate = post.getEndDate();
        this.location = post.getLocation();
        this.qualifications = post.getQualifications();
        this.tags = post.getTags();
    }
}
