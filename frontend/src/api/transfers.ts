import client from './client';
import { Transfer } from '../types';

export interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  toAmount?: number;
  description?: string;
  date: string;
}

export const transfersApi = {
  getAll: async (): Promise<Transfer[]> => {
    const res = await client.get<Transfer[]>('/transfers');
    return res.data;
  },

  create: async (data: TransferRequest): Promise<Transfer> => {
    const res = await client.post<Transfer>('/transfers', data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/transfers/${id}`);
  },
};
