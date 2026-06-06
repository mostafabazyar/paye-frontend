// src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = {
  async post(endpoint: string, body: unknown, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include',
      ...options,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Something went wrong');
    }

    return res.json();
  },

  async get(endpoint: string) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  },
};