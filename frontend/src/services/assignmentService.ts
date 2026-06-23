import api from '@/lib/api';
import type { AssignmentDTO, CreateAssignmentRequest, UpdateAssignmentRequest, Page } from '@/types/api';

export const assignmentService = {
  listByCourse: (courseId: number, page = 0, size = 20) =>
    api.get<Page<AssignmentDTO>>(`/api/assignments/course/${courseId}`, { params: { page, size } }).then((r) => r.data),

  getById: (id: number) =>
    api.get<AssignmentDTO>(`/api/assignments/${id}`).then((r) => r.data),

  create: (data: CreateAssignmentRequest) =>
    api.post<AssignmentDTO>('/api/assignments', data).then((r) => r.data),

  update: (id: number, data: UpdateAssignmentRequest) =>
    api.patch<AssignmentDTO>(`/api/assignments/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/api/assignments/${id}`).then((r) => r.data),
};
