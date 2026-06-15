package com.eduflow.controller;

import com.eduflow.domain.SubmissionStatus;
import com.eduflow.dto.*;
import com.eduflow.service.SubmissionService;
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

@RestController
@RequestMapping("/api/submissions")
@Tag(name = "Submissions", description = "Student submission management")
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @PostMapping
    @Operation(summary = "Student submits work for an assignment")
    public ResponseEntity<SubmissionDTO> submit(
            @Valid @RequestBody SubmitRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(submissionService.submit(request, userDetails.getUsername()));
    }

    @GetMapping("/my")
    @Operation(summary = "Student views only their own submissions")
    public ResponseEntity<Page<SubmissionDTO>> mySubmissions(
            Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                submissionService.getMySubmissions(userDetails.getUsername(), pageable));
    }

    @GetMapping("/assignment/{assignmentId}")
    @Operation(summary = "Instructor views all submissions for their assignment")
    public ResponseEntity<Page<SubmissionDTO>> forAssignment(
            @PathVariable Long assignmentId,
            @RequestParam(required = false) SubmissionStatus status,
            Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(submissionService.getForAssignment(
                assignmentId, status, userDetails.getUsername(), pageable));
    }
}
