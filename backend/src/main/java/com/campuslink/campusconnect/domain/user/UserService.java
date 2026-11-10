package com.campuslink.campusconnect.domain.user;

import com.campuslink.campusconnect.domain.projectapplication.ProjectApplicationRepository;
import com.campuslink.campusconnect.domain.user.dto.MyPageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ProjectApplicationRepository projectApplicationRepository;

    @Transactional(readOnly = true)
    public MyPageResponse getMyPage(Long userId) {
        // 1. 유저 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저를 찾을 수 없습니다. id=" + userId));

        // 2. 유저의 활동 내역(지원한 프로젝트 수) 조회
        int appliedCount = projectApplicationRepository.countByUser(user);

        // 3. DTO에 담아서 반환
        return new MyPageResponse(
                user.getEmail(),
                user.getName(),
                user.getNickname(),
                user.getDepartment(),
                appliedCount
        );
    }
}