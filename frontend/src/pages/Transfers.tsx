import React, { useEffect, useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { transfersApi, TransferRequest } from '../api/transfers';
import { accountsApi } from '../api/accounts';
import { Transfer, Account } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

export default function Transfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingTransfer, setDeletingTransfer] = useState<Transfer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<TransferRequest & { differentCurrencies: boolean }>();
  const fromAccountId = watch('fromAccountId');
  const showToAmount = accounts.find(a => a.id === fromAccountId)?.currency !==
    accounts.find(a => a.id === watch('toAccountId'))?.currency;

  const fetchData = async () => {
    try {
      const [transfers, accs] = await Promise.all([
        transfersApi.getAll(),
        accountsApi.getAll(),
      ]);
      setTransfers(transfers);
      setAccounts(accs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const payload: TransferRequest = {
        fromAccountId: data.fromAccountId,
        toAccountId: data.toAccountId,
        amount: Number(data.amount),
        toAmount: data.toAmount ? Number(data.toAmount) : undefined,
        description: data.description,
        date: data.date,
      };
      const created = await transfersApi.create(payload);
      setTransfers(prev => [created, ...prev]);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTransfer) return;
    setIsSubmitting(true);
    try {
      await transfersApi.delete(deletingTransfer.id);
      setTransfers(prev => prev.filter(t => t.id !== deletingTransfer.id));
      setDeletingTransfer(null);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner className="h-64" />;

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transfers</h1>
          <p className="text-gray-500 text-sm mt-1">Move money between your accounts</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          New Transfer
        </button>
      </div>

      {transfers.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">🔄</p>
          <h3 className="text-lg font-semibold text-gray-700">No transfers yet</h3>
          <p className="text-gray-400 text-sm mt-2 mb-6">Transfer money between your accounts</p>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">New Transfer</button>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">From</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">To</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Date</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Amount</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transfers.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.fromAccountName}</p>
                      <p className="text-xs text-gray-400">{t.fromAccountCurrency} {Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.toAccountName}</p>
                      <p className="text-xs text-gray-400">{t.toAccountCurrency} {Number(t.toAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{format(new Date(t.date), 'MMM d, yyyy')}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div>
                      <p className="text-sm font-semibold text-indigo-600">
                        {t.fromAccountCurrency} {Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      {t.fromAccountCurrency !== t.toAccountCurrency && (
                        <p className="text-xs text-gray-400">Rate: {Number(t.exchangeRate).toFixed(4)}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setDeletingTransfer(t)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4 text-red-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Transfer">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">From Account</label>
            <select {...register('fromAccountId', { required: true })} className="input">
              <option value="">Select account</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currency} {Number(a.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">To Account</label>
            <select {...register('toAccountId', { required: true })} className="input">
              <option value="">Select account</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currency} {Number(a.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Amount (from account)</label>
            <input
              {...register('amount', { required: true, valueAsNumber: true, min: 0.01 })}
              type="number"
              step="0.01"
              className="input"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="label">Amount (to account, if different currency)</label>
            <input
              {...register('toAmount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="input"
              placeholder="Leave blank if same currency"
            />
          </div>

          <div>
            <label className="label">Description</label>
            <input {...register('description')} className="input" placeholder="Optional" />
          </div>

          <div>
            <label className="label">Date</label>
            <input
              {...register('date', { required: true })}
              type="date"
              defaultValue={format(new Date(), 'yyyy-MM-dd')}
              className="input"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Processing...' : 'Transfer'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingTransfer}
        onClose={() => setDeletingTransfer(null)}
        onConfirm={handleDelete}
        title="Delete Transfer"
        message="Are you sure? This will reverse the balances on both accounts."
        isLoading={isSubmitting}
      />
    </div>
  );
}
