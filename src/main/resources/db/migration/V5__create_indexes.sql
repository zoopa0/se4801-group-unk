-- V5: Add B-tree indexes on all FK join columns for query performance
CREATE INDEX idx_enrollments_student_id    ON enrollments  (student_id);
CREATE INDEX idx_enrollments_course_id     ON enrollments  (course_id);
CREATE INDEX idx_assignments_course_id     ON assignments  (course_id);
CREATE INDEX idx_submissions_assignment_id ON submissions  (assignment_id);
CREATE INDEX idx_submissions_student_id    ON submissions  (student_id);
CREATE INDEX idx_courses_instructor_id     ON courses      (instructor_id);
