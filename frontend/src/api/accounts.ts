import client from './client';
import { Account, AccountSummary, AccountType } from '../types';

export interface AccountRequest {
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
  color?: string;
}

export const accountsApi = {
  getAll: async (): Promise<Account[]> => {
    const res = await client.get<Account[]>('/accounts');
    return res.data;
  },

  create: async (data: AccountRequest): Promise<Account> => {
    const res = await client.post<Account>('/accounts', data);
    return res.data;
  },

  update: async (id: string, data: AccountRequest): Promise<Account> => {
    const res = await client.put<Account>(`/accounts/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/accounts/${id}`);
  },

  getSummary: async (id: string, startDate?: string, endDate?: string): Promise<AccountSummary> => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const res = await client.get<AccountSummary>(`/accounts/${id}/summary`, { params });
    return res.data;
  },
};
