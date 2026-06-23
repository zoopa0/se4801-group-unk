import api from '@/lib/api';
import type { UserDTO, AdminUpdateUserRequest, Role, Page, CourseDTO, UpdateCourseRequest } from '@/types/api';

export const adminService = {
  listUsers: (params: { role?: Role; active?: boolean; page?: number; size?: number } = {}) =>
    api.get<Page<UserDTO>>('/api/admin/users', { params }).then((r) => r.data),

  updateUser: (id: number, data: AdminUpdateUserRequest) =>
    api.patch<UserDTO>(`/api/admin/users/${id}`, data).then((r) => r.data),

  deleteUser: (id: number) =>
    api.delete(`/api/admin/users/${id}`).then((r) => r.data),

  listCourses: (params: { page?: number; size?: number } = {}) =>
    api.get<Page<CourseDTO>>('/api/admin/courses', { params }).then((r) => r.data),

  moderateCourse: (id: number, data: UpdateCourseRequest) =>
    api.patch<CourseDTO>(`/api/admin/courses/${id}`, data).then((r) => r.data),

  deleteCourse: (id: number) =>
    api.delete(`/api/admin/courses/${id}`).then((r) => r.data),
};
