package com.eduflow.controller;

import com.eduflow.dto.CourseDTO;
import com.eduflow.dto.UpdateCourseRequest;
import com.eduflow.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/courses")
@Tag(name = "Admin — Course Management", description = "Admin-only course operations")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCourseController {

    private final CourseService courseService;

    public AdminCourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    @Operation(summary = "List all courses (both drafts and published ones) paginated")
    public ResponseEntity<Page<CourseDTO>> listCourses(Pageable pageable) {
        return ResponseEntity.ok(courseService.listAllCourses(pageable));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Moderate (update) any course publishing status or details")
    public ResponseEntity<CourseDTO> moderateCourse(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCourseRequest request) {
        return ResponseEntity.ok(courseService.adminUpdateCourse(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Force-delete a course (purges enrollments and submissions)")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
