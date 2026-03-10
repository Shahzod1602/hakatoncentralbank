import client from './client';
import { Budget, BudgetType } from '../types';

export interface BudgetRequest {
  year: number;
  month: number;
  category: string;
  type: BudgetType;
  plannedAmount: number;
}

export const budgetsApi = {
  getAll: async (year?: number, month?: number): Promise<Budget[]> => {
    const params: Record<string, number> = {};
    if (year) params.year = year;
    if (month) params.month = month;
    const res = await client.get<Budget[]>('/budgets', { params });
    return res.data;
  },

  create: async (data: BudgetRequest): Promise<Budget> => {
    const res = await client.post<Budget>('/budgets', data);
    return res.data;
  },

  update: async (id: string, data: BudgetRequest): Promise<Budget> => {
    const res = await client.put<Budget>(`/budgets/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/budgets/${id}`);
  },
};
