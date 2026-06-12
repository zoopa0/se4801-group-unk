package com.eduflow.repository;

import com.eduflow.domain.Course;
import com.eduflow.domain.Enrollment;
import com.eduflow.domain.Role;
import com.eduflow.domain.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
public class EnrollmentRepositoryTest {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    private User student;
    private Course course;

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

        course = Course.builder()
                .courseCode("CS-101")
                .title("CS 101")
                .description("Intro")
                .published(true)
                .instructor(instructor)
                .build();
        course = courseRepository.save(course);

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .build();
        enrollmentRepository.save(enrollment);
    }

    @Test
    public void testExistsByStudentIdAndCourseId() {
        boolean exists = enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), course.getId());
        assertThat(exists).isTrue();

        boolean nonExistent = enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), 999L);
        assertThat(nonExistent).isFalse();
    }

    @Test
    public void testFindByStudentIdAndCourseId() {
        Optional<Enrollment> enrollment = enrollmentRepository.findByStudentIdAndCourseId(student.getId(), course.getId());
        assertThat(enrollment).isPresent();
        assertThat(enrollment.get().getStudent().getEmail()).isEqualTo("student@eduflow.com");
    }
}
