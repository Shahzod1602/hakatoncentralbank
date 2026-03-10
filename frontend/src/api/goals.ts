import api from './client';
import { SavingsGoal } from '../types';

export const goalsApi = {
  getAll: () => api.get<SavingsGoal[]>('/goals').then(r => r.data),
  create: (data: Partial<SavingsGoal>) => api.post<SavingsGoal>('/goals', data).then(r => r.data),
  update: (id: string, data: Partial<SavingsGoal>) => api.put<SavingsGoal>(`/goals/${id}`, data).then(r => r.data),
  deposit: (id: string, amount: number) => api.post<SavingsGoal>(`/goals/${id}/deposit`, { amount }).then(r => r.data),
  delete: (id: string) => api.delete(`/goals/${id}`),
};
