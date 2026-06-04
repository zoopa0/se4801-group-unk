-- V4: Create assignments and submissions tables
CREATE TABLE assignments (
    id          BIGSERIAL      PRIMARY KEY,
    course_id   BIGINT         NOT NULL REFERENCES courses(id),
    title       VARCHAR(200)   NOT NULL,
    description VARCHAR(2000),
    due_date    TIMESTAMP      NOT NULL,
    max_score   INT            NOT NULL DEFAULT 100,
    created_at  TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE TABLE submissions (
    id            BIGSERIAL      PRIMARY KEY,
    student_id    BIGINT         NOT NULL REFERENCES users(id),
    assignment_id BIGINT         NOT NULL REFERENCES assignments(id),
    content       VARCHAR(5000)  NOT NULL,
    status        VARCHAR(10)    NOT NULL CHECK (status IN ('ON_TIME','LATE')),
    submitted_at  TIMESTAMP      NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_submission UNIQUE (student_id, assignment_id)
);
