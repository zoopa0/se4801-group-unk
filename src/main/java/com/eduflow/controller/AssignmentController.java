package com.eduflow.controller;

import com.eduflow.dto.*;
import com.eduflow.service.AssignmentService;
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
@RequestMapping("/api/assignments")
@Tag(name = "Assignments", description = "Assignment CRUD")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping("/course/{courseId}")
    @Operation(summary = "List assignments for a course (paginated)")
    public ResponseEntity<Page<AssignmentDTO>> listByCourse(
            @PathVariable Long courseId,
            Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                assignmentService.listByCourse(courseId, userDetails.getUsername(), pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single assignment")
    public ResponseEntity<AssignmentDTO> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(assignmentService.getById(id, userDetails.getUsername()));
    }

    @PostMapping
    @Operation(summary = "Instructor creates an assignment for their course")
    public ResponseEntity<AssignmentDTO> create(
            @Valid @RequestBody CreateAssignmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assignmentService.create(request, userDetails.getUsername()));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Instructor updates an assignment (rejected if submissions exist)")
    public ResponseEntity<AssignmentDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAssignmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                assignmentService.update(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Instructor deletes an assignment (rejected if submissions exist)")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        assignmentService.delete(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
