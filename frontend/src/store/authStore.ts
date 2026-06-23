import { create } from 'zustand';
import type { UserDTO, Role } from '@/types/api';

interface AuthState {
  user: UserDTO | null;
  token: string | null;
  role: Role | null;
  login: (token: string, user: UserDTO) => void;
  logout: () => void;
  hydrate: () => void;
}

const getInitialState = () => {
  const token = localStorage.getItem('eduflow_token');
  const userStr = localStorage.getItem('eduflow_user');
  if (token && userStr) {
    try {
      const user: UserDTO = JSON.parse(userStr);
      return { token, user, role: user.role };
    } catch {
      localStorage.removeItem('eduflow_token');
      localStorage.removeItem('eduflow_user');
    }
  }
  return { token: null, user: null, role: null };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),

  login: (token, user) => {
    localStorage.setItem('eduflow_token', token);
    localStorage.setItem('eduflow_user', JSON.stringify(user));
    set({ token, user, role: user.role });
  },

  logout: () => {
    localStorage.removeItem('eduflow_token');
    localStorage.removeItem('eduflow_user');
    set({ token: null, user: null, role: null });
  },

  hydrate: () => {
    // Synchronously hydrated, but keep for backward compatibility
    const token = localStorage.getItem('eduflow_token');
    const userStr = localStorage.getItem('eduflow_user');
    if (token && userStr) {
      try {
        const user: UserDTO = JSON.parse(userStr);
        set({ token, user, role: user.role });
      } catch {
        localStorage.removeItem('eduflow_token');
        localStorage.removeItem('eduflow_user');
      }
    }
  },
}));
