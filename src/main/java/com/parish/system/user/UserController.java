package com.parish.system.user;

import com.parish.system.common.ApiResponse;
import com.parish.system.user.dto.UserResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class UserController {
    private final UserRepository userRepository;

    @GetMapping
    public ApiResponse<List<UserResponse>> all() {
        return ApiResponse.ok("Users fetched", userRepository.findAll().stream()
                .map(user -> new UserResponse(user.getId(), user.getUsername(), user.getRole().getName().name(),
                        user.getMember() == null ? null : user.getMember().getId()))
                .toList());
    }
}
