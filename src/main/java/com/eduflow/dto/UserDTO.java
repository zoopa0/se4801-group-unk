package com.eduflow.dto;

import com.eduflow.domain.Role;
import java.time.LocalDateTime;

public record UserDTO(
        Long id,
        String email,
        String fullName,
        Role role,
        boolean active,
        LocalDateTime createdAt
) {}
