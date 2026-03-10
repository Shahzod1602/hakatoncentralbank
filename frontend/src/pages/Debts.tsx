import React, { useEffect, useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { debtsApi, DebtRequest } from '../api/debts';
import { Debt, DebtType, DebtStatus } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import clsx from 'clsx';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'RUB', 'UZS', 'JPY', 'CNY'];

export default function Debts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DebtType>('DEBT');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DebtRequest>();

  const fetchData = async () => {
    try {
      const data = await debtsApi.getAll();
      setDebts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingDebt(null);
    reset({ type: activeTab, personName: '', amount: undefined, currency: 'USD', description: '', dueDate: '' });
    setIsModalOpen(true);
  };

  const openEdit = (debt: Debt) => {
    setEditingDebt(debt);
    reset({
      type: debt.type,
      personName: debt.personName,
      amount: debt.amount,
      currency: debt.currency,
      description: debt.description,
      dueDate: debt.dueDate,
      status: debt.status,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: DebtRequest) => {
    setIsSubmitting(true);
    try {
      if (editingDebt) {
        const updated = await debtsApi.update(editingDebt.id, data);
        setDebts(prev => prev.map(d => d.id === updated.id ? updated : d));
      } else {
        const created = await debtsApi.create(data);
        setDebts(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingDebt) return;
    setIsSubmitting(true);
    try {
      await debtsApi.delete(deletingDebt.id);
      setDebts(prev => prev.filter(d => d.id !== deletingDebt.id));
      setDeletingDebt(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (debt: Debt) => {
    try {
      const updated = await debtsApi.update(debt.id, {
        ...debt,
        status: debt.status === 'OPEN' ? 'CLOSED' : 'OPEN',
      });
      setDebts(prev => prev.map(d => d.id === updated.id ? updated : d));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDebts = debts.filter(d => d.type === activeTab);
  const openCount = filteredDebts.filter(d => d.status === 'OPEN').length;
  const totalOpen = filteredDebts
    .filter(d => d.status === 'OPEN')
    .reduce((sum, d) => sum + Number(d.amount), 0);

  if (isLoading) return <LoadingSpinner className="h-64" />;

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Debts & Receivables</h1>
          <p className="text-gray-500 text-sm mt-1">Track money you owe and are owed</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Add {activeTab === 'DEBT' ? 'Debt' : 'Receivable'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('DEBT')}
          className={clsx(
            'px-5 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'DEBT' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          I Owe ({debts.filter(d => d.type === 'DEBT').length})
        </button>
        <button
          onClick={() => setActiveTab('RECEIVABLE')}
          className={clsx(
            'px-5 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'RECEIVABLE' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          Owed to Me ({debts.filter(d => d.type === 'RECEIVABLE').length})
        </button>
      </div>

      {/* Summary */}
      {openCount > 0 && (
        <div className={clsx(
          'rounded-xl p-4 flex items-center gap-3',
          activeTab === 'DEBT' ? 'bg-red-50' : 'bg-emerald-50'
        )}>
          <span className="text-2xl">{activeTab === 'DEBT' ? '💸' : '💰'}</span>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {activeTab === 'DEBT' ? 'Total amount you owe' : 'Total amount owed to you'}
            </p>
            <p className={clsx('text-xl font-bold', activeTab === 'DEBT' ? 'text-red-700' : 'text-emerald-700')}>
              ${totalOpen.toLocaleString('en-US', { minimumFractionDigits: 2 })} open
            </p>
          </div>
        </div>
      )}

      {/* List */}
      {filteredDebts.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">{activeTab === 'DEBT' ? '💸' : '🤝'}</p>
          <h3 className="text-lg font-semibold text-gray-700">
            {activeTab === 'DEBT' ? 'No debts recorded' : 'No receivables recorded'}
          </h3>
          <p className="text-gray-400 text-sm mt-2 mb-6">
            {activeTab === 'DEBT' ? 'Track money you owe to others' : 'Track money others owe you'}
          </p>
          <button onClick={openCreate} className="btn-primary">Add {activeTab === 'DEBT' ? 'Debt' : 'Receivable'}</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDebts.map(debt => (
            <div key={debt.id} className={clsx(
              'card flex items-center gap-4 py-4',
              debt.status === 'CLOSED' && 'opacity-60'
            )}>
              <div className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0',
                debt.status === 'OPEN'
                  ? (activeTab === 'DEBT' ? 'bg-red-50' : 'bg-emerald-50')
                  : 'bg-gray-50'
              )}>
                {debt.status === 'OPEN' ? (activeTab === 'DEBT' ? '💸' : '💰') : '✅'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{debt.personName}</p>
                  <span className={clsx(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    debt.status === 'OPEN' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-500'
                  )}>
                    {debt.status}
                  </span>
                </div>
                {debt.description && <p className="text-xs text-gray-400 mt-0.5">{debt.description}</p>}
                {debt.dueDate && (
                  <p className="text-xs text-gray-400">Due: {format(new Date(debt.dueDate), 'MMM d, yyyy')}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className={clsx('text-base font-bold',
                  activeTab === 'DEBT' ? 'text-red-600' : 'text-emerald-600'
                )}>
                  {debt.currency} {Number(debt.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleStatus(debt)}
                  className={clsx(
                    'text-xs px-3 py-1.5 rounded-lg font-medium transition-colors',
                    debt.status === 'OPEN'
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {debt.status === 'OPEN' ? 'Close' : 'Reopen'}
                </button>
                <button onClick={() => openEdit(debt)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <PencilIcon className="w-4 h-4 text-gray-400" />
                </button>
                <button onClick={() => setDeletingDebt(debt)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                  <TrashIcon className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDebt ? 'Edit' : `New ${activeTab === 'DEBT' ? 'Debt' : 'Receivable'}`}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Type</label>
            <select {...register('type', { required: true })} className="input">
              <option value="DEBT">I Owe (Debt)</option>
              <option value="RECEIVABLE">Owed to Me (Receivable)</option>
            </select>
          </div>

          <div>
            <label className="label">Person Name</label>
            <input {...register('personName', { required: 'Name is required' })} className="input" placeholder="John Doe" />
            {errors.personName && <p className="text-red-500 text-xs mt-1">{errors.personName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount</label>
              <input
                {...register('amount', { required: true, valueAsNumber: true, min: 0.01 })}
                type="number"
                step="0.01"
                className="input"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="label">Currency</label>
              <select {...register('currency', { required: true })} className="input">
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <input {...register('description')} className="input" placeholder="What is this for?" />
          </div>

          <div>
            <label className="label">Due Date (optional)</label>
            <input {...register('dueDate')} type="date" className="input" />
          </div>

          {editingDebt && (
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving...' : editingDebt ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingDebt}
        onClose={() => setDeletingDebt(null)}
        onConfirm={handleDelete}
        title="Delete Record"
        message={`Are you sure you want to delete the ${activeTab === 'DEBT' ? 'debt' : 'receivable'} record for "${deletingDebt?.personName}"?`}
        isLoading={isSubmitting}
      />
    </div>
  );
}
