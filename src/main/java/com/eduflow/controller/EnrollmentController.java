package com.eduflow.controller;

import com.eduflow.dto.*;
import com.eduflow.service.EnrollmentService;
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
@RequestMapping("/api/enrollments")
@Tag(name = "Enrollments", description = "Student enrollment management")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping
    @Operation(summary = "Student enrolls in a published course")
    public ResponseEntity<EnrollmentDTO> enroll(
            @Valid @RequestBody EnrollRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(enrollmentService.enroll(request, userDetails.getUsername()));
    }

    @GetMapping("/my")
    @Operation(summary = "Student views their own enrollments")
    public ResponseEntity<Page<EnrollmentDTO>> myEnrollments(
            Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                enrollmentService.getMyEnrollments(userDetails.getUsername(), pageable));
    }

    @GetMapping("/course/{courseId}")
    @Operation(summary = "Instructor views all enrollments for their course")
    public ResponseEntity<List<EnrollmentDTO>> courseEnrollments(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                enrollmentService.getCourseEnrollments(courseId, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Student drops an enrollment")
    public ResponseEntity<Void> drop(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        enrollmentService.drop(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
