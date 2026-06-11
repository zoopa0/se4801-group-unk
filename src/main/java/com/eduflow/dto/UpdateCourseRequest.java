package com.eduflow.dto;

import jakarta.validation.constraints.Size;

public record UpdateCourseRequest(
        @Size(max = 200) String title,
        @Size(max = 1000) String description,
        Boolean published
) {}
