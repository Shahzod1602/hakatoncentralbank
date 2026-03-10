import React, { useEffect, useState, useCallback } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { transactionsApi, TransactionRequest } from '../api/transactions';
import { accountsApi } from '../api/accounts';
import { Transaction, Account, TransactionType, PageResponse } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import clsx from 'clsx';

const EXPENSE_CATEGORIES = ['Food & Dining', 'Transport', 'Shopping', 'Entertainment', 'Healthcare', 'Education', 'Utilities', 'Rent', 'Insurance', 'Travel', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investments', 'Business', 'Gift', 'Rental', 'Other'];

export default function Transactions() {
  const [data, setData] = useState<PageResponse<Transaction>>({ content: [], totalElements: 0, totalPages: 0, size: 20, number: 0 });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<TransactionType | ''>('');

  const [filters, setFilters] = useState({
    accountId: '',
    type: '' as TransactionType | '',
    category: '',
    startDate: '',
    endDate: '',
    page: 0,
  });

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<TransactionRequest & { customCategory: string }>();
  const watchedType = watch('type');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [txData, accs, cats] = await Promise.all([
        transactionsApi.getAll({
          accountId: filters.accountId || undefined,
          type: (filters.type as TransactionType) || undefined,
          category: filters.category || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          page: filters.page,
          size: 20,
        }),
        accountsApi.getAll(),
        transactionsApi.getCategories(),
      ]);
      setData(txData);
      setAccounts(accs);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditingTx(null);
    reset({
      accountId: accounts[0]?.id || '',
      type: 'EXPENSE',
      amount: undefined,
      category: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    setIsModalOpen(true);
  };

  const openEdit = (tx: Transaction) => {
    setEditingTx(tx);
    reset({
      accountId: tx.accountId,
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      description: tx.description,
      date: tx.date,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const payload: TransactionRequest = {
        accountId: data.accountId,
        type: data.type,
        amount: Number(data.amount),
        category: data.customCategory || data.category,
        description: data.description,
        date: data.date,
      };
      if (editingTx) {
        const updated = await transactionsApi.update(editingTx.id, payload);
        setData(prev => ({ ...prev, content: prev.content.map(t => t.id === updated.id ? updated : t) }));
      } else {
        await transactionsApi.create(payload);
        fetchData();
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTx) return;
    setIsSubmitting(true);
    try {
      await transactionsApi.delete(deletingTx.id);
      setData(prev => ({ ...prev, content: prev.content.filter(t => t.id !== deletingTx.id) }));
      setDeletingTx(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestedCategories = watchedType === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500 text-sm mt-1">{data.totalElements} total transactions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
              showFilters ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50')}
          >
            <FunnelIcon className="w-4 h-4" />
            Filters
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <select
              className="input"
              value={filters.accountId}
              onChange={e => setFilters(f => ({ ...f, accountId: e.target.value, page: 0 }))}
            >
              <option value="">All Accounts</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select
              className="input"
              value={filters.type}
              onChange={e => setFilters(f => ({ ...f, type: e.target.value as any, page: 0 }))}
            >
              <option value="">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
            <select
              className="input"
              value={filters.category}
              onChange={e => setFilters(f => ({ ...f, category: e.target.value, page: 0 }))}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="date"
              className="input"
              value={filters.startDate}
              onChange={e => setFilters(f => ({ ...f, startDate: e.target.value, page: 0 }))}
            />
            <input
              type="date"
              className="input"
              value={filters.endDate}
              onChange={e => setFilters(f => ({ ...f, endDate: e.target.value, page: 0 }))}
            />
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={() => setFilters({ accountId: '', type: '', category: '', startDate: '', endDate: '', page: 0 })}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner className="h-48" />
        ) : data.content.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-500 font-medium">No transactions found</p>
            <button onClick={openCreate} className="btn-primary mt-4">Add Transaction</button>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Transaction</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Account</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Date</th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Amount</th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.content.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${
                          tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {tx.type === 'INCOME' ? '↑' : '↓'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{tx.category || 'Uncategorized'}</p>
                          {tx.description && <p className="text-xs text-gray-400">{tx.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{tx.accountName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{format(new Date(tx.date), 'MMM d, yyyy')}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-semibold ${
                        tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{tx.accountCurrency} {Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(tx)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <PencilIcon className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={() => setDeletingTx(tx)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <TrashIcon className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
                <p className="text-sm text-gray-500">
                  Page {data.number + 1} of {data.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={data.number === 0}
                    onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                    className="btn-secondary disabled:opacity-40 text-sm py-1.5 px-3"
                  >
                    Previous
                  </button>
                  <button
                    disabled={data.number >= data.totalPages - 1}
                    onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                    className="btn-secondary disabled:opacity-40 text-sm py-1.5 px-3"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTx ? 'Edit Transaction' : 'New Transaction'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select {...register('type', { required: true })} className="input">
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
            <div>
              <label className="label">Account</label>
              <select {...register('accountId', { required: 'Account is required' })} className="input">
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Amount</label>
            <input
              {...register('amount', { required: 'Amount is required', valueAsNumber: true, min: { value: 0.01, message: 'Must be positive' } })}
              type="number"
              step="0.01"
              className="input"
              placeholder="0.00"
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="label">Category</label>
            <select {...register('category')} className="input">
              <option value="">Select category</option>
              {suggestedCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Custom Category</label>
            <input {...register('customCategory')} className="input" placeholder="Or type a custom category" />
          </div>

          <div>
            <label className="label">Description</label>
            <input {...register('description')} className="input" placeholder="Optional note" />
          </div>

          <div>
            <label className="label">Date</label>
            <input {...register('date', { required: true })} type="date" className="input" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving...' : editingTx ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingTx}
        onClose={() => setDeletingTx(null)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? The account balance will be reversed."
        isLoading={isSubmitting}
      />
    </div>
  );
}
