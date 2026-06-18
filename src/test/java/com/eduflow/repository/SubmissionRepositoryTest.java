package com.eduflow.repository;

import com.eduflow.domain.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
public class SubmissionRepositoryTest {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    private User student;
    private Assignment assignment;

    @BeforeEach
    public void setUp() {
        User instructor = User.builder()
                .email("inst@eduflow.com")
                .passwordHash("pwd")
                .fullName("Inst")
                .role(Role.INSTRUCTOR)
                .active(true)
                .build();
        instructor = userRepository.save(instructor);

        student = User.builder()
                .email("student@eduflow.com")
                .passwordHash("pwd")
                .fullName("Student")
                .role(Role.STUDENT)
                .active(true)
                .build();
        student = userRepository.save(student);

        Course course = Course.builder()
                .courseCode("CS-101")
                .title("CS 101")
                .description("Intro")
                .published(true)
                .instructor(instructor)
                .build();
        course = courseRepository.save(course);

        assignment = Assignment.builder()
                .course(course)
                .title("Homework 1")
                .description("Solve problems")
                .dueDate(LocalDateTime.now().plusDays(1))
                .maxScore(100)
                .build();
        assignment = assignmentRepository.save(assignment);

        Submission submission = Submission.builder()
                .student(student)
                .assignment(assignment)
                .content("My solution")
                .status(SubmissionStatus.ON_TIME)
                .build();
        submissionRepository.save(submission);
    }

    @Test
    public void testFindByStudentId() {
        Page<Submission> studentSubmissions = submissionRepository.findByStudentId(student.getId(), PageRequest.of(0, 10));
        assertThat(studentSubmissions.getContent()).hasSize(1);
        assertThat(studentSubmissions.getContent().get(0).getContent()).isEqualTo("My solution");
    }

    @Test
    public void testFindByAssignmentIdAndStatus() {
        Page<Submission> submissions = submissionRepository.findByAssignmentIdAndStatus(
                assignment.getId(), SubmissionStatus.ON_TIME, PageRequest.of(0, 10));
        assertThat(submissions.getContent()).hasSize(1);

        Page<Submission> lateSubmissions = submissionRepository.findByAssignmentIdAndStatus(
                assignment.getId(), SubmissionStatus.LATE, PageRequest.of(0, 10));
        assertThat(lateSubmissions.getContent()).isEmpty();
    }

    @Test
    public void testExistsByStudentIdAndAssignmentId() {
        boolean exists = submissionRepository.existsByStudentIdAndAssignmentId(student.getId(), assignment.getId());
        assertThat(exists).isTrue();
    }
}
