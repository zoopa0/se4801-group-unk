package com.eduflow.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record UpdateAssignmentRequest(
        @Size(max = 200) String title,
        @Size(max = 2000) String description,
        @Future LocalDateTime dueDate
) {}
