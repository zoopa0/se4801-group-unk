// ── Enums ────────────────────────────────────────────────────────────────────
export type Role = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
export type EnrollmentStatus = 'ACTIVE' | 'DROPPED' | 'COMPLETED';
export type SubmissionStatus = 'ON_TIME' | 'LATE';

// ── Response DTOs (match Spring Boot records exactly) ────────────────────────
export interface UserDTO {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface CourseDTO {
  id: number;
  instructorId: number;
  instructorName: string;
  title: string;
  description: string | null;
  courseCode: string;
  published: boolean;
  createdAt: string;
}

export interface EnrollmentDTO {
  id: number;
  studentId: number;
  studentName: string;
  courseId: number;
  courseTitle: string;
  status: EnrollmentStatus;
  enrolledAt: string;
}

export interface AssignmentDTO {
  id: number;
  courseId: number;
  courseTitle: string;
  title: string;
  description: string | null;
  dueDate: string;
  maxScore: number;
  createdAt: string;
}

export interface SubmissionDTO {
  id: number;
  studentId: number;
  studentName: string;
  assignmentId: number;
  assignmentTitle: string;
  content: string;
  status: SubmissionStatus;
  submittedAt: string;
}

export interface TokenResponse {
  token: string;
  expiresAt: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  message: string;
  path: string;
}

// ── Spring Boot Page<T> ──────────────────────────────────────────────────────
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

// ── Request DTOs ─────────────────────────────────────────────────────────────
export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
  courseCode: string;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  published?: boolean;
}

export interface EnrollRequest {
  courseId: number;
}

export interface CreateAssignmentRequest {
  courseId: number;
  title: string;
  description?: string;
  dueDate: string;
  maxScore: number;
}

export interface UpdateAssignmentRequest {
  title?: string;
  description?: string;
  dueDate?: string;
}

export interface SubmitRequest {
  assignmentId: number;
  content: string;
}

export interface AdminUpdateUserRequest {
  role?: Role;
  active?: boolean;
}
