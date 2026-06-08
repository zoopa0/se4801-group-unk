package com.eduflow.service;

import com.eduflow.domain.*;
import com.eduflow.dto.*;
import com.eduflow.exception.AccessForbiddenException;
import com.eduflow.exception.DuplicateResourceException;
import com.eduflow.exception.ResourceNotFoundException;
import com.eduflow.repository.CourseRepository;
import com.eduflow.repository.EnrollmentRepository;
import com.eduflow.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             CourseRepository courseRepository,
                             UserRepository userRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @PreAuthorize("hasRole('STUDENT')")
    @Transactional
    public EnrollmentDTO enroll(EnrollRequest request, String studentEmail) {
        User student = findUserOrThrow(studentEmail);
        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Course not found: " + request.courseId()));

        if (!course.getPublished()) {
            throw new AccessForbiddenException("Cannot enroll in an unpublished course");
        }
        if (enrollmentRepository.existsByStudentIdAndCourseId(
                student.getId(), course.getId())) {
            throw new DuplicateResourceException("Already enrolled in this course");
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .status(EnrollmentStatus.ACTIVE)
                .build();
        return toDTO(enrollmentRepository.save(enrollment));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @Transactional(readOnly = true)
    public Page<EnrollmentDTO> getMyEnrollments(String studentEmail, Pageable pageable) {
        User student = findUserOrThrow(studentEmail);
        return enrollmentRepository.findByStudentId(student.getId(), pageable)
                .map(this::toDTO);
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getCourseEnrollments(Long courseId, String instructorEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));

        // BOLA: instructor must own the course
        if (!course.getInstructor().getEmail().equals(instructorEmail)) {
            throw new AccessForbiddenException("You do not own this course");
        }
        return enrollmentRepository.findByCourseId(courseId).stream()
                .map(this::toDTO).toList();
    }

    @PreAuthorize("hasRole('STUDENT')")
    @Transactional
    public void drop(Long enrollmentId, String studentEmail) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Enrollment not found: " + enrollmentId));

        // BOLA: student must own the enrollment
        if (!enrollment.getStudent().getEmail().equals(studentEmail)) {
            throw new AccessForbiddenException("You do not own this enrollment");
        }
        enrollmentRepository.deleteById(enrollmentId);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private User findUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private EnrollmentDTO toDTO(Enrollment e) {
        return new EnrollmentDTO(
                e.getId(),
                e.getStudent().getId(),
                e.getStudent().getFullName(),
                e.getCourse().getId(),
                e.getCourse().getTitle(),
                e.getStatus(),
                e.getEnrolledAt());
    }
}
