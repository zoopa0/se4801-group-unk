package com.eduflow.dto;

import com.eduflow.domain.EnrollmentStatus;
import java.time.LocalDateTime;

public record EnrollmentDTO(
        Long id,
        Long studentId,
        String studentName,
        Long courseId,
        String courseTitle,
        EnrollmentStatus status,
        LocalDateTime enrolledAt
) {}
