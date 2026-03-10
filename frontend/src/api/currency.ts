import api from './client';

export const currencyApi = {
  getRates: (base = 'USD') => api.get<{ base: string; rates: Record<string, number>; source: string }>(`/currency/rates?base=${base}`).then(r => r.data),
};
