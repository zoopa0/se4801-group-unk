package com.eduflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SubmitRequest(
        @NotNull Long assignmentId,
        @NotBlank @Size(max = 5000) String content
) {}
