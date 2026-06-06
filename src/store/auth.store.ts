import { create } from 'zustand';

interface User {
  token?: string;
  [key: string]: unknown;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user, token: user?.token }),
  logout: () => set({ user: null, token: null }),
}));