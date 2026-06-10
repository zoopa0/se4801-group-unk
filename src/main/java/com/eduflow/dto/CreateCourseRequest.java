package com.eduflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCourseRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 1000) String description,
        @NotBlank @Size(max = 20) String courseCode,
        Boolean published
) {}
