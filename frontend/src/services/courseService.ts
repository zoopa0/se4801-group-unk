import api from '@/lib/api';
import type { CourseDTO, CreateCourseRequest, UpdateCourseRequest, Page } from '@/types/api';

export const courseService = {
  listPublished: (page = 0, size = 20) =>
    api.get<Page<CourseDTO>>('/api/courses', { params: { page, size } }).then((r) => r.data),

  listInstructorCourses: (page = 0, size = 20) =>
    api.get<Page<CourseDTO>>('/api/courses/instructor', { params: { page, size } }).then((r) => r.data),

  getById: (id: number) =>
    api.get<CourseDTO>(`/api/courses/${id}`).then((r) => r.data),

  search: (keyword?: string, courseCode?: string) =>
    api.get<CourseDTO[]>('/api/courses/search', { params: { keyword, courseCode } }).then((r) => r.data),

  create: (data: CreateCourseRequest) =>
    api.post<CourseDTO>('/api/courses', data).then((r) => r.data),

  update: (id: number, data: UpdateCourseRequest) =>
    api.patch<CourseDTO>(`/api/courses/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/api/courses/${id}`).then((r) => r.data),
};
