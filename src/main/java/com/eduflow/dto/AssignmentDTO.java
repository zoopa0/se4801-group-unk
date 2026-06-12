package com.eduflow.dto;

import java.time.LocalDateTime;

public record AssignmentDTO(
        Long id,
        Long courseId,
        String courseTitle,
        String title,
        String description,
        LocalDateTime dueDate,
        int maxScore,
        LocalDateTime createdAt
) {}
