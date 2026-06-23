import api from '@/lib/api';
import type { SubmissionDTO, SubmitRequest, SubmissionStatus, Page } from '@/types/api';

export const submissionService = {
  submit: (data: SubmitRequest) =>
    api.post<SubmissionDTO>('/api/submissions', data).then((r) => r.data),

  getMySubmissions: (page = 0, size = 20) =>
    api.get<Page<SubmissionDTO>>('/api/submissions/my', { params: { page, size } }).then((r) => r.data),

  getForAssignment: (assignmentId: number, status?: SubmissionStatus, page = 0, size = 20) =>
    api.get<Page<SubmissionDTO>>(`/api/submissions/assignment/${assignmentId}`, {
      params: { status, page, size },
    }).then((r) => r.data),
};
