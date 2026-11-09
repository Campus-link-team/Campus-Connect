package com.campuslink.campusconnect.domain.projectpost.dto;

import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter // 데이터를 읽어오기 위해 반드시 필요합니다!
@NoArgsConstructor // 스프링이 JSON 요청을 객체로 변환할 때 필요합니다!

public class ProjectPostUpdateRequest {
    private String title;
    private String content;
    private int capacity;
    private String recruitmentStatus;
    private int currentApplicantCount;
    private String category;
    private LocalDate endDate;
    private String location;
    private String qualifications;
    private String tags;
}
