package com.parish.system.auth.dto;

import com.parish.system.user.RoleName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank String username,
        @NotBlank @Size(min = 8) String password,
        @NotNull RoleName role,
        Long memberId
) {
}
