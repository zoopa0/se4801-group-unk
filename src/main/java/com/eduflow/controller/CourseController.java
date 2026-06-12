package com.eduflow.controller;

import com.eduflow.dto.*;
import com.eduflow.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@Tag(name = "Courses", description = "Course CRUD and search")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    @Operation(summary = "List all published courses (paginated)")
    public ResponseEntity<Page<CourseDTO>> list(Pageable pageable) {
        return ResponseEntity.ok(courseService.listPublished(pageable));
    }

    @GetMapping("/instructor")
    @Operation(summary = "Get instructor's own courses")
    public ResponseEntity<Page<CourseDTO>> listByInstructor(
            Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(courseService.listByInstructor(userDetails.getUsername(), pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single course by ID")
    public ResponseEntity<CourseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getById(id));
    }

    @GetMapping("/search")
    @Operation(summary = "Search courses by keyword or course code")
    public ResponseEntity<List<CourseDTO>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String courseCode) {
        return ResponseEntity.ok(courseService.search(keyword, courseCode));
    }

    @PostMapping
    @Operation(summary = "Instructor creates a new course")
    public ResponseEntity<CourseDTO> create(
            @Valid @RequestBody CreateCourseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseService.create(request, userDetails.getUsername()));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Instructor updates their own course")
    public ResponseEntity<CourseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCourseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(courseService.update(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Admin hard-deletes a course")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        courseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
