package com.eduflow.dto;

import jakarta.validation.constraints.NotNull;

public record EnrollRequest(
        @NotNull Long courseId
) {}
