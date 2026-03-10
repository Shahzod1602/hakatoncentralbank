import client from './client';
import { Transaction, TransactionType, PageResponse } from '../types';

export interface TransactionRequest {
  accountId: string;
  type: TransactionType;
  amount: number;
  category?: string;
  description?: string;
  date: string;
}

export interface TransactionFilters {
  accountId?: string;
  type?: TransactionType;
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export const transactionsApi = {
  getAll: async (filters: TransactionFilters = {}): Promise<PageResponse<Transaction>> => {
    const params: Record<string, string | number> = {};
    if (filters.accountId) params.accountId = filters.accountId;
    if (filters.type) params.type = filters.type;
    if (filters.category) params.category = filters.category;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.page !== undefined) params.page = filters.page;
    if (filters.size !== undefined) params.size = filters.size;
    const res = await client.get<PageResponse<Transaction>>('/transactions', { params });
    return res.data;
  },

  create: async (data: TransactionRequest): Promise<Transaction> => {
    const res = await client.post<Transaction>('/transactions', data);
    return res.data;
  },

  update: async (id: string, data: TransactionRequest): Promise<Transaction> => {
    const res = await client.put<Transaction>(`/transactions/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/transactions/${id}`);
  },

  getCategories: async (): Promise<string[]> => {
    const res = await client.get<string[]>('/transactions/categories');
    return res.data;
  },
};
