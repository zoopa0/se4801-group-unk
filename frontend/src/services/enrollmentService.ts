import api from '@/lib/api';
import type { EnrollmentDTO, EnrollRequest, Page } from '@/types/api';

export const enrollmentService = {
  enroll: (data: EnrollRequest) =>
    api.post<EnrollmentDTO>('/api/enrollments', data).then((r) => r.data),

  getMyEnrollments: (page = 0, size = 20) =>
    api.get<Page<EnrollmentDTO>>('/api/enrollments/my', { params: { page, size } }).then((r) => r.data),

  getCourseEnrollments: (courseId: number) =>
    api.get<EnrollmentDTO[]>(`/api/enrollments/course/${courseId}`).then((r) => r.data),

  drop: (id: number) =>
    api.delete(`/api/enrollments/${id}`).then((r) => r.data),
};
