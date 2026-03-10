import client from './client';
import { AuthResponse, User } from '../types';

export const authApi = {
  register: async (data: { username: string; email: string; password: string }): Promise<AuthResponse> => {
    const res = await client.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await client.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  me: async (): Promise<User> => {
    const res = await client.get<User>('/auth/me');
    return res.data;
  },
};
