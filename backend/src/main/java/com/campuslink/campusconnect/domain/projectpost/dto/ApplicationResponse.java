package com.campuslink.campusconnect.domain.projectpost.dto;

import com.campuslink.campusconnect.domain.projectapplication.ProjectApplication;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

// 지원자 목록 응답 (모집글 작성자가 승인·거절할 때 사용)
@Getter
@AllArgsConstructor
public class ApplicationResponse {
    private Long applicationId;
    private Long applicantId;
    private String applicantNickname;
    private String roleName;      // 희망 역할
    private String introduction;  // 지원 메시지
    private String status;        // PENDING, APPROVED, REJECTED
    private LocalDateTime appliedAt;

    public static ApplicationResponse from(ProjectApplication application) {
        return new ApplicationResponse(
                application.getId(),
                application.getUser().getId(),
                application.getUser().getNickname(),
                application.getRoleName(),
                application.getIntroduction(),
                application.getStatus(),
                application.getAppliedAt()
        );
    }
}
