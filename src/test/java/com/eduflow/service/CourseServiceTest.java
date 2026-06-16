package com.eduflow.service;

import com.eduflow.domain.Course;
import com.eduflow.domain.Role;
import com.eduflow.domain.User;
import com.eduflow.dto.CourseDTO;
import com.eduflow.dto.CreateCourseRequest;
import com.eduflow.dto.UpdateCourseRequest;
import com.eduflow.exception.AccessForbiddenException;
import com.eduflow.repository.CourseRepository;
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
public class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CourseService courseService;

    private User instructor;
    private User otherInstructor;
    private Course course;

    @BeforeEach
    public void setUp() {
        instructor = User.builder()
                .id(1L)
                .email("instructor@eduflow.com")
                .fullName("Instructor")
                .role(Role.INSTRUCTOR)
                .active(true)
                .build();

        otherInstructor = User.builder()
                .id(2L)
                .email("other@eduflow.com")
                .fullName("Other Instructor")
                .role(Role.INSTRUCTOR)
                .active(true)
                .build();

        course = Course.builder()
                .id(100L)
                .courseCode("CS-101")
                .title("Intro CS")
                .description("Intro")
                .published(true)
                .instructor(instructor)
                .build();
    }

    @Test
    public void testCreateCourseHappyPath() {
        CreateCourseRequest request = new CreateCourseRequest("CS-101", "Intro CS", "Intro", true);
        when(userRepository.findByEmail("instructor@eduflow.com")).thenReturn(Optional.of(instructor));
        when(courseRepository.save(any(Course.class))).thenReturn(course);

        CourseDTO result = courseService.create(request, "instructor@eduflow.com");

        assertThat(result.title()).isEqualTo("Intro CS");
        verify(courseRepository).save(any(Course.class));
    }

    @Test
    public void testUpdateCourseHappyPath() {
        UpdateCourseRequest request = new UpdateCourseRequest("New Title", "New Desc", true);
        when(courseRepository.findById(100L)).thenReturn(Optional.of(course));
        when(courseRepository.save(any(Course.class))).thenReturn(course);

        CourseDTO result = courseService.update(100L, request, "instructor@eduflow.com");

        assertThat(result.id()).isEqualTo(100L);
        verify(courseRepository).save(course);
    }

    @Test
    public void testUpdateCourseNotOwnerThrowsException() {
        UpdateCourseRequest request = new UpdateCourseRequest("New Title", "New Desc", true);
        when(courseRepository.findById(100L)).thenReturn(Optional.of(course));

        assertThatThrownBy(() -> courseService.update(100L, request, "other@eduflow.com"))
                .isInstanceOf(AccessForbiddenException.class)
                .hasMessageContaining("You do not own this course");

        verify(courseRepository, never()).save(any(Course.class));
    }

    @Test
    public void testDeleteCourseHappyPath() {
        when(courseRepository.existsById(100L)).thenReturn(true);

        courseService.delete(100L);

        verify(courseRepository).deleteById(100L);
    }
}
