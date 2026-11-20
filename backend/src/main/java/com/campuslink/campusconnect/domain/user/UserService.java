package com.campuslink.campusconnect.domain.user;

import com.campuslink.campusconnect.domain.projectapplication.ProjectApplicationRepository;
import com.campuslink.campusconnect.domain.user.dto.MyPageResponse;
import com.campuslink.campusconnect.domain.user.dto.UserResponse;
import com.campuslink.campusconnect.global.exception.BusinessException;
import com.campuslink.campusconnect.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final ProjectApplicationRepository projectApplicationRepository;

    public UserResponse getMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        return UserResponse.from(user);
    }

    public MyPageResponse getMyPage(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        int appliedCount = projectApplicationRepository.countByUser(user);
        return new MyPageResponse(user.getEmail(), user.getNickname(), user.getDepartment(), appliedCount);
    }
}