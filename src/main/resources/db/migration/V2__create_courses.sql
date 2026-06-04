-- V2: Create courses table
CREATE TABLE courses (
    id            BIGSERIAL     PRIMARY KEY,
    instructor_id BIGINT        NOT NULL REFERENCES users(id),
    title         VARCHAR(200)  NOT NULL,
    description   VARCHAR(1000),
    course_code   VARCHAR(20)   NOT NULL,
    published     BOOLEAN       NOT NULL DEFAULT false,
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_courses_course_code ON courses (course_code);
