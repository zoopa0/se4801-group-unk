package com.eduflow.dto;

import com.eduflow.domain.SubmissionStatus;
import java.time.LocalDateTime;

public record SubmissionDTO(
        Long id,
        Long studentId,
        String studentName,
        Long assignmentId,
        String assignmentTitle,
        String content,
        SubmissionStatus status,
        LocalDateTime submittedAt
) {}
