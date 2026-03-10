import api from './client';
import { RecurringTransaction } from '../types';

export const recurringApi = {
  getAll: () => api.get<RecurringTransaction[]>('/recurring').then(r => r.data),
  create: (data: Partial<RecurringTransaction>) => api.post<RecurringTransaction>('/recurring', data).then(r => r.data),
  update: (id: string, data: Partial<RecurringTransaction>) => api.put<RecurringTransaction>(`/recurring/${id}`, data).then(r => r.data),
  execute: (id: string) => api.post(`/recurring/${id}/execute`),
  delete: (id: string) => api.delete(`/recurring/${id}`),
};
