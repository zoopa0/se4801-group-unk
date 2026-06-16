package com.eduflow.repository;

import com.eduflow.domain.Course;
import com.eduflow.domain.Role;
import com.eduflow.domain.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
public class CourseRepositoryTest {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    private User instructor;

    @BeforeEach
    public void setUp() {
        instructor = User.builder()
                .email("test.instructor@eduflow.com")
                .passwordHash("hashedpassword")
                .fullName("Test Instructor")
                .role(Role.INSTRUCTOR)
                .active(true)
                .build();
        instructor = userRepository.save(instructor);

        Course course1 = Course.builder()
                .courseCode("CS-101")
                .title("Introduction to Computer Science")
                .description("Basics of CS")
                .published(true)
                .instructor(instructor)
                .build();
        courseRepository.save(course1);

        Course course2 = Course.builder()
                .courseCode("CS-102")
                .title("Data Structures")
                .description("Advanced CS")
                .published(false)
                .instructor(instructor)
                .build();
        courseRepository.save(course2);
    }

    @Test
    public void testFindByCourseCode() {
        Optional<Course> course = courseRepository.findByCourseCode("CS-101");
        assertThat(course).isPresent();
        assertThat(course.get().getTitle()).isEqualTo("Introduction to Computer Science");
    }

    @Test
    public void testFindByInstructorId() {
        List<Course> courses = courseRepository.findByInstructorId(instructor.getId());
        assertThat(courses).hasSize(2);
    }

    @Test
    public void testFindAllByPublishedTrue() {
        Page<Course> publishedCourses = courseRepository.findAllByPublishedTrue(PageRequest.of(0, 10));
        assertThat(publishedCourses.getContent()).hasSize(1);
        assertThat(publishedCourses.getContent().get(0).getCourseCode()).isEqualTo("CS-101");
    }

    @Test
    public void testFindByInstructorIdPaginated() {
        Page<Course> instructorCourses = courseRepository.findByInstructorId(instructor.getId(), PageRequest.of(0, 10));
        assertThat(instructorCourses.getContent()).hasSize(2);
    }
}
