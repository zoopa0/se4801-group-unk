package com.eduflow.service;

import com.eduflow.domain.*;
import com.eduflow.dto.*;
import com.eduflow.exception.AccessForbiddenException;
import com.eduflow.exception.DuplicateResourceException;
import com.eduflow.exception.LateSubmissionException;
import com.eduflow.repository.AssignmentRepository;
import com.eduflow.repository.SubmissionRepository;
import com.eduflow.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SubmissionServiceTest {

    @Mock
    private SubmissionRepository submissionRepository;

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SubmissionService submissionService;

    private User student;
    private User instructor;
    private Course course;
    private Assignment assignment;
    private Submission submission;

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

        assignment = Assignment.builder()
                .id(300L)
                .course(course)
                .title("Homework 1")
                .description("Write code")
                .dueDate(LocalDateTime.now().plusDays(2))
                .maxScore(100)
                .build();

        submission = Submission.builder()
                .id(400L)
                .student(student)
                .assignment(assignment)
                .content("Done")
                .status(SubmissionStatus.ON_TIME)
                .build();
    }

    @Test
    public void testSubmitHappyPath() {
        SubmitRequest request = new SubmitRequest(300L, "Done");
        when(userRepository.findByEmail("student@eduflow.com")).thenReturn(Optional.of(student));
        when(assignmentRepository.findById(300L)).thenReturn(Optional.of(assignment));
        when(submissionRepository.existsByStudentIdAndAssignmentId(1L, 300L)).thenReturn(false);
        when(submissionRepository.save(any(Submission.class))).thenReturn(submission);

        SubmissionDTO result = submissionService.submit(request, "student@eduflow.com");

        assertThat(result.id()).isEqualTo(400L);
        assertThat(result.status()).isEqualTo(SubmissionStatus.ON_TIME);
        verify(submissionRepository).save(any(Submission.class));
    }

    @Test
    public void testSubmitLateThrowsException() {
        assignment.setDueDate(LocalDateTime.now().minusDays(1)); // past due
        SubmitRequest request = new SubmitRequest(300L, "Done");
        when(userRepository.findByEmail("student@eduflow.com")).thenReturn(Optional.of(student));
        when(assignmentRepository.findById(300L)).thenReturn(Optional.of(assignment));

        assertThatThrownBy(() -> submissionService.submit(request, "student@eduflow.com"))
                .isInstanceOf(LateSubmissionException.class)
                .hasMessageContaining("past due date");

        verify(submissionRepository, never()).save(any(Submission.class));
    }

    @Test
    public void testSubmitDuplicateThrowsException() {
        SubmitRequest request = new SubmitRequest(300L, "Done");
        when(userRepository.findByEmail("student@eduflow.com")).thenReturn(Optional.of(student));
        when(assignmentRepository.findById(300L)).thenReturn(Optional.of(assignment));
        when(submissionRepository.existsByStudentIdAndAssignmentId(1L, 300L)).thenReturn(true);

        assertThatThrownBy(() -> submissionService.submit(request, "student@eduflow.com"))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already submitted");

        verify(submissionRepository, never()).save(any(Submission.class));
    }

    @Test
    public void testGetForAssignmentNotOwnerThrowsException() {
        when(assignmentRepository.findById(300L)).thenReturn(Optional.of(assignment));

        assertThatThrownBy(() -> submissionService.getForAssignment(300L, null, "other@eduflow.com", Pageable.unpaged()))
                .isInstanceOf(AccessForbiddenException.class)
                .hasMessageContaining("You do not own the course");
    }
}
