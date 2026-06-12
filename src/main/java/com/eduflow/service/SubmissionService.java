package com.eduflow.service;

import com.eduflow.domain.*;
import com.eduflow.dto.*;
import com.eduflow.exception.AccessForbiddenException;
import com.eduflow.exception.DuplicateResourceException;
import com.eduflow.exception.LateSubmissionException;
import com.eduflow.exception.ResourceNotFoundException;
import com.eduflow.repository.AssignmentRepository;
import com.eduflow.repository.SubmissionRepository;
import com.eduflow.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;

    public SubmissionService(SubmissionRepository submissionRepository,
                             AssignmentRepository assignmentRepository,
                             UserRepository userRepository) {
        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
    }

    @PreAuthorize("hasRole('STUDENT')")
    @Transactional
    public SubmissionDTO submit(SubmitRequest request, String studentEmail) {
        User student = findUserOrThrow(studentEmail);
        Assignment assignment = assignmentRepository.findById(request.assignmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Assignment not found: " + request.assignmentId()));

        // Reject if past due date
        if (LocalDateTime.now().isAfter(assignment.getDueDate())) {
            throw new LateSubmissionException(
                    "Submission rejected: past due date " + assignment.getDueDate());
        }

        // Reject duplicate submission
        if (submissionRepository.existsByStudentIdAndAssignmentId(
                student.getId(), assignment.getId())) {
            throw new DuplicateResourceException("You have already submitted this assignment");
        }

        // Compute ON_TIME (always true here since we checked above, but kept explicit)
        SubmissionStatus status = LocalDateTime.now().isAfter(assignment.getDueDate())
                ? SubmissionStatus.LATE : SubmissionStatus.ON_TIME;

        Submission submission = Submission.builder()
                .student(student)
                .assignment(assignment)
                .content(request.content())
                .status(status)
                .build();
        return toDTO(submissionRepository.save(submission));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @Transactional(readOnly = true)
    public Page<SubmissionDTO> getMySubmissions(String studentEmail, Pageable pageable) {
        User student = findUserOrThrow(studentEmail);
        // BOLA: query includes WHERE student_id = authenticatedUserId
        return submissionRepository.findByStudentId(student.getId(), pageable)
                .map(this::toDTO);
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Transactional(readOnly = true)
    public Page<SubmissionDTO> getForAssignment(
            Long assignmentId, SubmissionStatus status,
            String instructorEmail, Pageable pageable) {

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Assignment not found: " + assignmentId));

        // BOLA: instructor must own the parent course
        if (!assignment.getCourse().getInstructor().getEmail().equals(instructorEmail)) {
            throw new AccessForbiddenException(
                    "You do not own the course for this assignment");
        }

        if (status != null) {
            return submissionRepository
                    .findByAssignmentIdAndStatus(assignmentId, status, pageable)
                    .map(this::toDTO);
        }
        return submissionRepository.findByAssignmentId(assignmentId, pageable)
                .map(this::toDTO);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private User findUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private SubmissionDTO toDTO(Submission s) {
        return new SubmissionDTO(
                s.getId(),
                s.getStudent().getId(),
                s.getStudent().getFullName(),
                s.getAssignment().getId(),
                s.getAssignment().getTitle(),
                s.getContent(),
                s.getStatus(),
                s.getSubmittedAt());
    }
}
