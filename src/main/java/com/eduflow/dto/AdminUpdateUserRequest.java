package com.eduflow.dto;

import com.eduflow.domain.Role;

public record AdminUpdateUserRequest(
        Role role,
        Boolean active
) {}
