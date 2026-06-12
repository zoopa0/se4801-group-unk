package com.eduflow.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public record CreateAssignmentRequest(
        @NotNull Long courseId,
        @NotBlank @Size(max = 200) String title,
        @Size(max = 2000) String description,
        @NotNull @Future LocalDateTime dueDate,
        @NotNull @Min(1) Integer maxScore
) {}
