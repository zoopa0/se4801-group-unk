package com.eduflow.service;

import com.eduflow.domain.Course;
import com.eduflow.domain.User;
import com.eduflow.dto.*;
import com.eduflow.exception.AccessForbiddenException;
import com.eduflow.exception.ResourceNotFoundException;
import com.eduflow.repository.CourseRepository;
import com.eduflow.repository.CourseSpecification;
import com.eduflow.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public CourseService(CourseRepository courseRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Page<CourseDTO> listPublished(Pageable pageable) {
        return courseRepository.findAllByPublishedTrue(pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public CourseDTO getById(Long id) {
        return toDTO(findCourseOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<CourseDTO> search(String keyword, String courseCode) {
        return courseRepository
                .findAll(CourseSpecification.search(keyword, courseCode))
                .stream().map(this::toDTO).toList();
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Transactional
    public CourseDTO create(CreateCourseRequest request, String instructorEmail) {
        User instructor = findUserOrThrow(instructorEmail);
        Course course = Course.builder()
                .instructor(instructor)
                .title(request.title())
                .description(request.description())
                .courseCode(request.courseCode())
                .published(request.published() != null ? request.published() : false)
                .build();
        return toDTO(courseRepository.save(course));
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Transactional(readOnly = true)
    public Page<CourseDTO> listByInstructor(String instructorEmail, Pageable pageable) {
        User instructor = findUserOrThrow(instructorEmail);
        return courseRepository.findByInstructorId(instructor.getId(), pageable).map(this::toDTO);
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Transactional
    public CourseDTO update(Long id, UpdateCourseRequest request, String instructorEmail) {
        Course course = findCourseOrThrow(id);
        verifyOwnership(course, instructorEmail);

        if (request.title() != null)       course.setTitle(request.title());
        if (request.description() != null) course.setDescription(request.description());
        if (request.published() != null)   course.setPublished(request.published());

        return toDTO(courseRepository.save(course));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void delete(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Course not found: " + id);
        }
        courseRepository.deleteById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public Page<CourseDTO> listAllCourses(Pageable pageable) {
        return courseRepository.findAll(pageable).map(this::toDTO);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public CourseDTO adminUpdateCourse(Long id, UpdateCourseRequest request) {
        Course course = findCourseOrThrow(id);
        if (request.title() != null)       course.setTitle(request.title());
        if (request.description() != null) course.setDescription(request.description());
        if (request.published() != null)   course.setPublished(request.published());
        return toDTO(courseRepository.save(course));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Course findCourseOrThrow(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + id));
    }

    private User findUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private void verifyOwnership(Course course, String email) {
        if (!course.getInstructor().getEmail().equals(email)) {
            throw new AccessForbiddenException("You do not own this course");
        }
    }

    public CourseDTO toDTO(Course course) {
        return new CourseDTO(
                course.getId(),
                course.getInstructor().getId(),
                course.getInstructor().getFullName(),
                course.getTitle(),
                course.getDescription(),
                course.getCourseCode(),
                course.getPublished(),
                course.getCreatedAt());
    }
}
