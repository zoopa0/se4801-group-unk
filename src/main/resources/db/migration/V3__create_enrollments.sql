-- V3: Create enrollments table
CREATE TABLE enrollments (
    id          BIGSERIAL   PRIMARY KEY,
    student_id  BIGINT      NOT NULL REFERENCES users(id),
    course_id   BIGINT      NOT NULL REFERENCES courses(id),
    status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE','DROPPED','COMPLETED')),
    enrolled_at TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_enrollment UNIQUE (student_id, course_id)
);
