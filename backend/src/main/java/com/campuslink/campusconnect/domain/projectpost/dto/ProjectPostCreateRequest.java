package com.campuslink.campusconnect.domain.projectpost.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor

public class ProjectPostCreateRequest {
    private String title;
    private String content;
    private int capacity;
    // 처음 생성할 때는 무조건 "모집중" 상태일 테니,
    // recruitmentStatus는 클라이언트에게 받지 않고 서버에서 고정하는 것이 좋다.
    // currentApplicantCount 또한 처음 생성할 때는 무조건 "0명" 상태일 테니,
    // currentApplicantCount는 클라이언트에게 받지 않고 서버에서 고정하는 것이 좋다.
    private String category;
    private LocalDate startDate;
    private LocalDate endDate;
    private String location;
    private String qualifications;
    private String tags;
}
