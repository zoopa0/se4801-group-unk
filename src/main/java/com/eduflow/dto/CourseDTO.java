package com.eduflow.dto;

import java.time.LocalDateTime;

public record CourseDTO(
        Long id,
        Long instructorId,
        String instructorName,
        String title,
        String description,
        String courseCode,
        boolean published,
        LocalDateTime createdAt
) {}
