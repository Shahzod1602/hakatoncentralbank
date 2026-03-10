import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { analyticsApi } from '../api/analytics';
import { transactionsApi } from '../api/transactions';
import { accountsApi } from '../api/accounts';
import { aiApi } from '../api/ai';
import { AnalyticsSummary, Transaction, Account, AiInsight } from '../types';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

export default function Dashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<AiInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');
        const [sum, txPage, accs, timeSeries] = await Promise.all([
          analyticsApi.getSummary(startDate, endDate),
          transactionsApi.getAll({ page: 0, size: 5 }),
          accountsApi.getAll(),
          analyticsApi.getTimeSeries('DAY', format(subMonths(new Date(), 1), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')),
        ]);
        setSummary(sum);
        setRecentTransactions(txPage.content);
        setAccounts(accs);
        setChartData(timeSeries.data.slice(-14).map(d => ({
          date: format(new Date(d.date), 'MMM d'),
          income: Number(d.income),
          expense: Number(d.expense),
        })));
        try {
          const insights = await aiApi.getInsights();
          setAiInsights(insights);
        } catch {
          // AI insights are optional, ignore errors
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <LoadingSpinner className="h-64" />;

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Total Balance"
          value={`$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
          subtitle={`${accounts.length} accounts`}
          icon="💼"
          color="blue"
        />
        <StatCard
          title="Monthly Income"
          value={`$${Number(summary?.totalIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
          subtitle="This month"
          icon="📈"
          color="green"
        />
        <StatCard
          title="Monthly Expense"
          value={`$${Number(summary?.totalExpense || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
          subtitle="This month"
          icon="📉"
          color="red"
        />
        <StatCard
          title="Net Savings"
          value={`$${Number(summary?.netBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
          subtitle="Income - Expenses"
          icon="🎯"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-gray-900">Income vs Expenses</h2>
            <span className="text-xs text-gray-400">Last 14 days</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, '']}
                />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-60 text-gray-400 text-sm">
              No transaction data yet
            </div>
          )}
        </div>

        {/* Accounts */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900">Accounts</h2>
            <Link to="/accounts" className="text-indigo-600 text-sm hover:text-indigo-700 font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {accounts.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No accounts yet</p>
            ) : (
              accounts.slice(0, 5).map(acc => (
                <div key={acc.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: acc.color || '#6366f1' }}
                  >
                    {acc.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{acc.name}</p>
                    <p className="text-xs text-gray-400">{acc.type}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    {acc.currency} {Number(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {aiInsights.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">AI Maslahatlar</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {aiInsights.map((ins, i) => {
              const bgMap: Record<string, string> = {
                WARNING: 'bg-amber-50 border-amber-200',
                SUCCESS: 'bg-emerald-50 border-emerald-200',
                INFO: 'bg-blue-50 border-blue-200',
              };
              return (
                <div key={i} className={`flex-shrink-0 w-72 p-4 rounded-xl border ${bgMap[ins.type] || 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{ins.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{ins.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{ins.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">Recent Transactions</h2>
          <Link to="/transactions" className="text-indigo-600 text-sm hover:text-indigo-700 font-medium">
            View all
          </Link>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm">No transactions yet</p>
            <Link to="/transactions" className="btn-primary mt-4 inline-block">
              Add first transaction
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentTransactions.map(tx => (
              <div key={tx.id} className="flex items-center gap-4 py-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                  tx.type === 'INCOME' ? 'bg-emerald-50' : 'bg-red-50'
                }`}>
                  {tx.type === 'INCOME' ? '⬆️' : '⬇️'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{tx.category || 'Uncategorized'}</p>
                  <p className="text-xs text-gray-400 truncate">{tx.description || tx.accountName} • {format(new Date(tx.date), 'MMM d')}</p>
                </div>
                <p className={`text-sm font-semibold flex-shrink-0 ${
                  tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {tx.type === 'INCOME' ? '+' : '-'}${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
