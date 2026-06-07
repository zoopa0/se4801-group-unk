package com.eduflow.repository;

import com.eduflow.domain.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface CourseRepository
        extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {

    Page<Course> findAllByPublishedTrue(Pageable pageable);

    Optional<Course> findByCourseCode(String courseCode);

    List<Course> findByInstructorId(Long instructorId);

    Page<Course> findByInstructorId(Long instructorId, Pageable pageable);
}
