import client from './client';
import { AnalyticsSummary, CategorySummary, TimeSeriesResponse, CalendarResponse, TransactionType } from '../types';

export const analyticsApi = {
  getSummary: async (startDate?: string, endDate?: string): Promise<AnalyticsSummary> => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const res = await client.get<AnalyticsSummary>('/analytics/summary', { params });
    return res.data;
  },

  getByCategory: async (type?: TransactionType, startDate?: string, endDate?: string): Promise<CategorySummary[]> => {
    const params: Record<string, string> = {};
    if (type) params.type = type;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const res = await client.get<CategorySummary[]>('/analytics/by-category', { params });
    return res.data;
  },

  getTimeSeries: async (groupBy: string = 'DAY', startDate?: string, endDate?: string): Promise<TimeSeriesResponse> => {
    const params: Record<string, string> = { groupBy };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const res = await client.get<TimeSeriesResponse>('/analytics/time-series', { params });
    return res.data;
  },

  getCalendar: async (year?: number, month?: number): Promise<CalendarResponse> => {
    const params: Record<string, number> = {};
    if (year) params.year = year;
    if (month) params.month = month;
    const res = await client.get<CalendarResponse>('/analytics/calendar', { params });
    return res.data;
  },
};
