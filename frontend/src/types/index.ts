export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type AccountType = 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'CASH' | 'INVESTMENT';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
  color: string;
  createdAt: string;
}

export interface AccountSummary {
  balance: number;
  income: number;
  expense: number;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  accountId: string;
  accountName: string;
  accountCurrency: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface Transfer {
  id: string;
  fromAccountId: string;
  fromAccountName: string;
  fromAccountCurrency: string;
  toAccountId: string;
  toAccountName: string;
  toAccountCurrency: string;
  amount: number;
  toAmount: number;
  exchangeRate: number;
  description: string;
  date: string;
  createdAt: string;
}

export type DebtType = 'DEBT' | 'RECEIVABLE';
export type DebtStatus = 'OPEN' | 'CLOSED';

export interface Debt {
  id: string;
  type: DebtType;
  personName: string;
  amount: number;
  currency: string;
  description: string;
  status: DebtStatus;
  dueDate: string;
  createdAt: string;
}

export type BudgetType = 'INCOME' | 'EXPENSE';

export interface Budget {
  id: string;
  year: number;
  month: number;
  category: string;
  type: BudgetType;
  plannedAmount: number;
  actualAmount: number;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  accountBalances: {
    accountId: string;
    accountName: string;
    currency: string;
    balance: number;
    income: number;
    expense: number;
  }[];
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  income: number;
  expense: number;
  net: number;
}

export interface TimeSeriesResponse {
  data: TimeSeriesDataPoint[];
}

export interface CalendarDayData {
  date: string;
  income: number;
  expense: number;
  net: number;
}

export interface CalendarResponse {
  days: CalendarDayData[];
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progressPercent: number;
  currency: string;
  targetDate?: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface RecurringTransaction {
  id: string;
  accountId: string;
  accountName: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  description: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  nextDate: string;
  active: boolean;
  createdAt: string;
}

export interface AiInsight {
  type: 'WARNING' | 'SUCCESS' | 'INFO';
  icon: string;
  title: string;
  message: string;
  category?: string;
}

export interface HealthScore {
  score: number;
  grade: string;
  status: string;
  tips: string[];
  totalIncome: number;
  totalExpense: number;
}
