package com.eduflow.service;

import com.eduflow.domain.Assignment;
import com.eduflow.domain.Course;
import com.eduflow.dto.*;
import com.eduflow.exception.AccessForbiddenException;
import com.eduflow.exception.ResourceNotFoundException;
import com.eduflow.exception.SubmissionsExistException;
import com.eduflow.repository.AssignmentRepository;
import com.eduflow.repository.CourseRepository;
import com.eduflow.repository.EnrollmentRepository;
import com.eduflow.repository.SubmissionRepository;
import com.eduflow.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;

    public AssignmentService(AssignmentRepository assignmentRepository,
                             CourseRepository courseRepository,
                             EnrollmentRepository enrollmentRepository,
                             SubmissionRepository submissionRepository,
                             UserRepository userRepository) {
        this.assignmentRepository = assignmentRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
    }

    @PreAuthorize("hasAnyRole('STUDENT','INSTRUCTOR')")
    @Transactional(readOnly = true)
    public Page<AssignmentDTO> listByCourse(Long courseId, String userEmail, Pageable pageable) {
        Course course = findCourseOrThrow(courseId);
        checkCourseAccess(course, userEmail);
        return assignmentRepository.findByCourseId(courseId, pageable).map(this::toDTO);
    }

    @PreAuthorize("hasAnyRole('STUDENT','INSTRUCTOR')")
    @Transactional(readOnly = true)
    public AssignmentDTO getById(Long id, String userEmail) {
        Assignment assignment = findAssignmentOrThrow(id);
        checkCourseAccess(assignment.getCourse(), userEmail);
        return toDTO(assignment);
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Transactional
    public AssignmentDTO create(CreateAssignmentRequest request, String instructorEmail) {
        Course course = findCourseOrThrow(request.courseId());
        verifyInstructorOwns(course, instructorEmail);

        Assignment assignment = Assignment.builder()
                .course(course)
                .title(request.title())
                .description(request.description())
                .dueDate(request.dueDate())
                .maxScore(request.maxScore())
                .build();
        return toDTO(assignmentRepository.save(assignment));
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Transactional
    public AssignmentDTO update(Long id, UpdateAssignmentRequest request, String instructorEmail) {
        Assignment assignment = findAssignmentOrThrow(id);
        verifyInstructorOwns(assignment.getCourse(), instructorEmail);

        if (submissionRepository.existsByAssignmentId(id)) {
            throw new SubmissionsExistException(
                    "Cannot update assignment that already has submissions");
        }
        if (request.title() != null)       assignment.setTitle(request.title());
        if (request.description() != null) assignment.setDescription(request.description());
        if (request.dueDate() != null)     assignment.setDueDate(request.dueDate());

        return toDTO(assignmentRepository.save(assignment));
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Transactional
    public void delete(Long id, String instructorEmail) {
        Assignment assignment = findAssignmentOrThrow(id);
        verifyInstructorOwns(assignment.getCourse(), instructorEmail);

        if (submissionRepository.existsByAssignmentId(id)) {
            throw new SubmissionsExistException(
                    "Cannot delete assignment that already has submissions");
        }
        assignmentRepository.deleteById(id);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void checkCourseAccess(Course course, String userEmail) {
        // Instructor must own the course
        if (course.getInstructor().getEmail().equals(userEmail)) return;
        // Student must be enrolled
        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        boolean enrolled = enrollmentRepository
                .existsByStudentIdAndCourseId(user.getId(), course.getId());
        if (!enrolled) {
            throw new AccessForbiddenException("You are not enrolled in this course");
        }
    }

    private void verifyInstructorOwns(Course course, String email) {
        if (!course.getInstructor().getEmail().equals(email)) {
            throw new AccessForbiddenException("You do not own this course");
        }
    }

    private Course findCourseOrThrow(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + id));
    }

    private Assignment findAssignmentOrThrow(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + id));
    }

    private AssignmentDTO toDTO(Assignment a) {
        return new AssignmentDTO(
                a.getId(),
                a.getCourse().getId(),
                a.getCourse().getTitle(),
                a.getTitle(),
                a.getDescription(),
                a.getDueDate(),
                a.getMaxScore(),
                a.getCreatedAt());
    }
}
