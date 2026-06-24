package com.parish.system.auth;

import com.parish.system.auth.dto.AuthResponse;
import com.parish.system.auth.dto.LoginRequest;
import com.parish.system.auth.dto.RefreshTokenRequest;
import com.parish.system.auth.dto.RegisterRequest;
import com.parish.system.exception.BadRequestException;
import com.parish.system.exception.NotFoundException;
import com.parish.system.member.MemberRepository;
import com.parish.system.security.JwtProperties;
import com.parish.system.security.JwtService;
import com.parish.system.user.Role;
import com.parish.system.user.RoleRepository;
import com.parish.system.user.User;
import com.parish.system.user.UserRepository;
import com.parish.system.user.dto.UserResponse;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final MemberRepository memberRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new BadRequestException("Username already exists");
        }
        Role role = roleRepository.findByName(request.role()).orElseThrow(() -> new NotFoundException("Role not found"));
        User user = new User();
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(role);
        if (request.memberId() != null) {
            user.setMember(memberRepository.findById(request.memberId()).orElseThrow(() -> new NotFoundException("Member not found")));
        }
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        User user = userRepository.findByUsername(request.username()).orElseThrow(() -> new NotFoundException("User not found"));
        return tokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken token = refreshTokenRepository.findByTokenAndRevokedFalse(request.refreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));
        if (token.getExpiresAt().isBefore(Instant.now())) {
            token.setRevoked(true);
            throw new BadRequestException("Refresh token expired");
        }
        return tokens(token.getUser());
    }

    public UserResponse me() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return toResponse(user);
    }

    private AuthResponse tokens(User user) {
        String refreshValue = UUID.randomUUID().toString() + UUID.randomUUID();
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(refreshValue);
        refreshToken.setUser(user);
        refreshToken.setExpiresAt(Instant.now().plusMillis(jwtProperties.refreshTokenExpirationMs()));
        refreshTokenRepository.save(refreshToken);
        return new AuthResponse(jwtService.generateAccessToken(user), refreshValue, "Bearer",
                jwtService.expiresInSeconds(), toResponse(user));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getRole().getName().name(),
                user.getMember() == null ? null : user.getMember().getId());
    }
}
