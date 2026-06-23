import api from '@/lib/api';
import type { RegisterRequest, LoginRequest, UserDTO, TokenResponse } from '@/types/api';

export const authService = {
  register: (data: RegisterRequest) =>
    api.post<UserDTO>('/api/auth/register', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    api.post<TokenResponse>('/api/auth/login', data).then((r) => r.data),

  logout: () =>
    api.post('/api/auth/logout').then((r) => r.data),
};
