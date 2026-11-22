package com.campuslink.campusconnect.domain.projectpost.dto;

import com.campuslink.campusconnect.domain.projectapplication.ProjectApplication;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

// 마이페이지: 내 지원 내역
@Getter
@AllArgsConstructor
public class MyApplicationResponse {
    private Long applicationId;
    private Long projectId;
    private String projectTitle;
    private String recruitmentStatus; // RECRUITING, CLOSED
    private String roleName;          // 희망 역할
    private String status;            // PENDING, APPROVED, REJECTED
    private LocalDateTime appliedAt;

    public static MyApplicationResponse from(ProjectApplication application) {
        return new MyApplicationResponse(
                application.getId(),
                application.getProjectPost().getId(),
                application.getProjectPost().getTitle(),
                application.getProjectPost().getRecruitmentStatus(),
                application.getRoleName(),
                application.getStatus(),
                application.getAppliedAt()
        );
    }
}
