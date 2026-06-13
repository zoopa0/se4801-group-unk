package com.eduflow.dto;

import java.time.LocalDateTime;

public record TokenResponse(
        String token,
        LocalDateTime expiresAt
) {}
