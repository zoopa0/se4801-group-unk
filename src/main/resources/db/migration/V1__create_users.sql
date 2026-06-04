-- V1: Create users table
CREATE TABLE users (
    id           BIGSERIAL    PRIMARY KEY,
    email        VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name    VARCHAR(100) NOT NULL,
    role         VARCHAR(20)  NOT NULL CHECK (role IN ('ADMIN','INSTRUCTOR','STUDENT')),
    active       BOOLEAN      NOT NULL DEFAULT true,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_email ON users (email);
