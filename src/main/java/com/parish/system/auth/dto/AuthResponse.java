package com.parish.system.auth.dto;

import com.parish.system.user.dto.UserResponse;

public record AuthResponse(String accessToken, String refreshToken, String tokenType, long expiresIn, UserResponse user) {
}
