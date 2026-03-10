import api from './client';
import { AiInsight, HealthScore } from '../types';

export const aiApi = {
  categorize: (description: string) => api.post<{ category: string; confidence: number }>('/ai/categorize', { description }).then(r => r.data),
  getInsights: () => api.get<AiInsight[]>('/ai/insights').then(r => r.data),
  getHealthScore: () => api.get<HealthScore>('/ai/health-score').then(r => r.data),
};
