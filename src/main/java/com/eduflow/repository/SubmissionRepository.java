package com.eduflow.repository;

import com.eduflow.domain.Submission;
import com.eduflow.domain.SubmissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    Page<Submission> findByStudentId(Long studentId, Pageable pageable);

    Page<Submission> findByAssignmentId(Long assignmentId, Pageable pageable);

    Page<Submission> findByAssignmentIdAndStatus(
            Long assignmentId, SubmissionStatus status, Pageable pageable);

    boolean existsByStudentIdAndAssignmentId(Long studentId, Long assignmentId);

    boolean existsByAssignmentId(Long assignmentId);
}
