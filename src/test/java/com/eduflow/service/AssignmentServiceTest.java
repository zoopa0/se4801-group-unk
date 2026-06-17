package com.eduflow.service;

import com.eduflow.domain.*;
import com.eduflow.dto.*;
import com.eduflow.exception.AccessForbiddenException;
import com.eduflow.exception.SubmissionsExistException;
import com.eduflow.repository.AssignmentRepository;
import com.eduflow.repository.CourseRepository;
import com.eduflow.repository.SubmissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AssignmentServiceTest {

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private SubmissionRepository submissionRepository;

    @InjectMocks
    private AssignmentService assignmentService;

    private User instructor;
    private Course course;
    private Assignment assignment;

    @BeforeEach
    public void setUp() {
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
    }

    @Test
    public void testCreateAssignmentHappyPath() {
        CreateAssignmentRequest request = new CreateAssignmentRequest(100L, "Homework 1", "Write code", LocalDateTime.now().plusDays(2), 100);
        when(courseRepository.findById(100L)).thenReturn(Optional.of(course));
        when(assignmentRepository.save(any(Assignment.class))).thenReturn(assignment);

        AssignmentDTO result = assignmentService.create(request, "inst@eduflow.com");

        assertThat(result.id()).isEqualTo(300L);
        verify(assignmentRepository).save(any(Assignment.class));
    }

    @Test
    public void testCreateAssignmentNotOwnedThrowsException() {
        CreateAssignmentRequest request = new CreateAssignmentRequest(100L, "Homework 1", "Write code", LocalDateTime.now().plusDays(2), 100);
        when(courseRepository.findById(100L)).thenReturn(Optional.of(course));

        assertThatThrownBy(() -> assignmentService.create(request, "other@eduflow.com"))
                .isInstanceOf(AccessForbiddenException.class)
                .hasMessageContaining("You do not own this course");

        verify(assignmentRepository, never()).save(any(Assignment.class));
    }

    @Test
    public void testUpdateAssignmentSubmissionsExistThrowsException() {
        UpdateAssignmentRequest request = new UpdateAssignmentRequest("New Title", "New Desc", LocalDateTime.now().plusDays(2));
        when(assignmentRepository.findById(300L)).thenReturn(Optional.of(assignment));
        when(submissionRepository.existsByAssignmentId(300L)).thenReturn(true);

        assertThatThrownBy(() -> assignmentService.update(300L, request, "inst@eduflow.com"))
                .isInstanceOf(SubmissionsExistException.class)
                .hasMessageContaining("Cannot update assignment that already has submissions");

        verify(assignmentRepository, never()).save(any(Assignment.class));
    }
}
