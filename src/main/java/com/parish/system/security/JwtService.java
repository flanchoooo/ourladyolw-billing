package com.parish.system.security;

import com.parish.system.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final JwtProperties properties;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
    }

    public String generateAccessToken(User user) {
        return buildToken(user, properties.accessTokenExpirationMs());
    }

    public long expiresInSeconds() {
        return properties.accessTokenExpirationMs() / 1000;
    }

    public String extractUsername(String token) {
        return claims(token).getSubject();
    }

    public boolean isValid(String token, User user) {
        return extractUsername(token).equals(user.getUsername()) && claims(token).getExpiration().after(new Date());
    }

    private String buildToken(User user, long expirationMs) {
        Instant now = Instant.now();
        return Jwts.builder()
                .claims(Map.of(
                        "userId", user.getId(),
                        "username", user.getUsername(),
                        "role", user.getRole().getName().name()))
                .subject(user.getUsername())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMs)))
                .signWith(key())
                .compact();
    }

    private Claims claims(String token) {
        return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload();
    }

    private SecretKey key() {
        return Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
    }
}
