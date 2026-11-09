package com.campuslink.campusconnect.domain.auth.dto;

import com.campuslink.campusconnect.domain.user.User;

public record SignupResponse(Long id, String email, String nickname) {

    public static SignupResponse from(User user) {
        return new SignupResponse(user.getId(), user.getEmail(), user.getNickname());
    }
}
