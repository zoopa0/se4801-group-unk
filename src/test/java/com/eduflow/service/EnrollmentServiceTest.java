package com.eduflow.service;

import com.eduflow.domain.*;
import com.eduflow.dto.EnrollRequest;
import com.eduflow.dto.EnrollmentDTO;
import com.eduflow.exception.AccessForbiddenException;
import com.eduflow.exception.DuplicateResourceException;
import com.eduflow.repository.CourseRepository;
import com.eduflow.repository.EnrollmentRepository;
import com.eduflow.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EnrollmentServiceTest {

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private EnrollmentService enrollmentService;

    private User student;
    private User instructor;
    private Course course;
    private Enrollment enrollment;

    @BeforeEach
    public void setUp() {
        student = User.builder()
                .id(1L)
                .email("student@eduflow.com")
                .fullName("Student")
                .role(Role.STUDENT)
                .active(true)
                .build();

        instructor = User.builder()
                .id(2L)
                .email("inst@eduflow.com")
                .fullName("Instructor")
                .role(Role.INSTRUCTOR)
                .active(true)
                .build();

        course = Course.builder()
                .id(100L)
                .courseCode("CS-101")
                .title("Intro CS")
                .published(true)
                .instructor(instructor)
                .build();

        enrollment = Enrollment.builder()
                .id(500L)
                .student(student)
                .course(course)
                .status(EnrollmentStatus.ACTIVE)
                .build();
    }

    @Test
    public void testEnrollHappyPath() {
        EnrollRequest request = new EnrollRequest(100L);
        when(userRepository.findByEmail("student@eduflow.com")).thenReturn(Optional.of(student));
        when(courseRepository.findById(100L)).thenReturn(Optional.of(course));
        when(enrollmentRepository.existsByStudentIdAndCourseId(1L, 100L)).thenReturn(false);
        when(enrollmentRepository.save(any(Enrollment.class))).thenReturn(enrollment);

        EnrollmentDTO result = enrollmentService.enroll(request, "student@eduflow.com");

        assertThat(result.id()).isEqualTo(500L);
        verify(enrollmentRepository).save(any(Enrollment.class));
    }

    @Test
    public void testEnrollInUnpublishedCourseThrowsException() {
        course.setPublished(false);
        EnrollRequest request = new EnrollRequest(100L);
        when(userRepository.findByEmail("student@eduflow.com")).thenReturn(Optional.of(student));
        when(courseRepository.findById(100L)).thenReturn(Optional.of(course));

        assertThatThrownBy(() -> enrollmentService.enroll(request, "student@eduflow.com"))
                .isInstanceOf(AccessForbiddenException.class)
                .hasMessageContaining("Cannot enroll in an unpublished course");

        verify(enrollmentRepository, never()).save(any(Enrollment.class));
    }

    @Test
    public void testEnrollDuplicateThrowsException() {
        EnrollRequest request = new EnrollRequest(100L);
        when(userRepository.findByEmail("student@eduflow.com")).thenReturn(Optional.of(student));
        when(courseRepository.findById(100L)).thenReturn(Optional.of(course));
        when(enrollmentRepository.existsByStudentIdAndCourseId(1L, 100L)).thenReturn(true);

        assertThatThrownBy(() -> enrollmentService.enroll(request, "student@eduflow.com"))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Already enrolled in this course");

        verify(enrollmentRepository, never()).save(any(Enrollment.class));
    }

    @Test
    public void testGetCourseEnrollmentsNotOwnerThrowsException() {
        when(courseRepository.findById(100L)).thenReturn(Optional.of(course));

        assertThatThrownBy(() -> enrollmentService.getCourseEnrollments(100L, "other@eduflow.com"))
                .isInstanceOf(AccessForbiddenException.class)
                .hasMessageContaining("You do not own this course");
    }
}
