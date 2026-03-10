import client from './client';
import { Debt, DebtType, DebtStatus } from '../types';

export interface DebtRequest {
  type: DebtType;
  personName: string;
  amount: number;
  currency: string;
  description?: string;
  dueDate?: string;
  status?: DebtStatus;
}

export const debtsApi = {
  getAll: async (type?: DebtType, status?: DebtStatus): Promise<Debt[]> => {
    const params: Record<string, string> = {};
    if (type) params.type = type;
    if (status) params.status = status;
    const res = await client.get<Debt[]>('/debts', { params });
    return res.data;
  },

  create: async (data: DebtRequest): Promise<Debt> => {
    const res = await client.post<Debt>('/debts', data);
    return res.data;
  },

  update: async (id: string, data: DebtRequest): Promise<Debt> => {
    const res = await client.put<Debt>(`/debts/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/debts/${id}`);
  },
};
