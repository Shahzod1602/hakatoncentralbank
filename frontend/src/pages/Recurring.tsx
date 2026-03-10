import React, { useEffect, useState } from 'react';
import { recurringApi } from '../api/recurring';
import { accountsApi } from '../api/accounts';
import { RecurringTransaction, Account } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';

const FREQ_LABELS: Record<string, string> = { DAILY: 'Kunlik', WEEKLY: 'Haftalik', MONTHLY: 'Oylik', YEARLY: 'Yillik' };
const FREQ_ICONS: Record<string, string> = { DAILY: '📅', WEEKLY: '📆', MONTHLY: '🗓️', YEARLY: '📊' };

export default function Recurring() {
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RecurringTransaction | null>(null);
  const [deleteItem, setDeleteItem] = useState<RecurringTransaction | null>(null);
  const [form, setForm] = useState({ accountId: '', type: 'EXPENSE', amount: '', category: '', description: '', frequency: 'MONTHLY', nextDate: '' });

  const load = async () => {
    try {
      const [r, a] = await Promise.all([recurringApi.getAll(), accountsApi.getAll()]);
      setItems(r); setAccounts(a);
      if (a.length > 0 && !form.accountId) setForm(f => ({ ...f, accountId: a[0].id }));
    } finally { setIsLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, amount: parseFloat(form.amount), type: form.type as 'INCOME' | 'EXPENSE', frequency: form.frequency as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' };
    if (selectedItem) await recurringApi.update(selectedItem.id, data);
    else await recurringApi.create(data);
    setShowModal(false); setSelectedItem(null);
    setForm({ accountId: accounts[0]?.id || '', type: 'EXPENSE', amount: '', category: '', description: '', frequency: 'MONTHLY', nextDate: '' });
    load();
  };

  const handleExecute = async (id: string) => {
    await recurringApi.execute(id);
    load();
  };

  const monthlyTotal = (type: 'INCOME' | 'EXPENSE') => items
    .filter(i => i.type === type)
    .reduce((sum, i) => {
      const m = { DAILY: 30, WEEKLY: 4.33, MONTHLY: 1, YEARLY: 1/12 }[i.frequency] || 1;
      return sum + i.amount * m;
    }, 0);

  if (isLoading) return <LoadingSpinner className="h-64" />;

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Takrorlanuvchi to'lovlar</h1>
          <p className="text-gray-500 text-sm mt-1">Avtomatik daromad va xarajatlar</p>
        </div>
        <button onClick={() => { setSelectedItem(null); setShowModal(true); }} className="btn-primary">+ Qo'shish</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-500">Oylik avtomatik daromad</p>
          <p className="text-2xl font-bold text-emerald-600">+${monthlyTotal('INCOME').toFixed(0)}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Oylik avtomatik xarajat</p>
          <p className="text-2xl font-bold text-red-500">-${monthlyTotal('EXPENSE').toFixed(0)}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">🔁</p>
          <p className="text-gray-500">Takrorlanuvchi to'lovlar yo'q. Ijara, telefon, internet kabi to'lovlarni qo'shing.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-4">Qo'shish</button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="card flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${item.type === 'INCOME' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                {FREQ_ICONS[item.frequency]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{item.description || item.category}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {item.type === 'INCOME' ? 'Daromad' : 'Xarajat'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{item.accountName} • {FREQ_LABELS[item.frequency]} • Keyingisi: {format(new Date(item.nextDate), 'dd MMM yyyy')}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`font-bold text-lg ${item.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {item.type === 'INCOME' ? '+' : '-'}${item.amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">{item.category}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleExecute(item.id)} className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium">▶ Bajar</button>
                <button onClick={() => setDeleteItem(item)} className="text-xs px-2 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setSelectedItem(null); }} title="Takrorlanuvchi to'lov qo'shish">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Turi</label>
              <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="EXPENSE">Xarajat</option>
                <option value="INCOME">Daromad</option>
              </select>
            </div>
            <div>
              <label className="label">Hisob</label>
              <select className="input" value={form.accountId} onChange={e => setForm({...form, accountId: e.target.value})} required>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Miqdor</label>
              <input type="number" className="input" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required min="0.01" step="0.01" />
            </div>
            <div>
              <label className="label">Kategoriya</label>
              <input className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Ijara, Telefon..." />
            </div>
          </div>
          <div>
            <label className="label">Tavsif</label>
            <input className="input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Qo'shimcha ma'lumot" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Takrorlanish</label>
              <select className="input" value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})}>
                <option value="DAILY">Kunlik</option>
                <option value="WEEKLY">Haftalik</option>
                <option value="MONTHLY">Oylik</option>
                <option value="YEARLY">Yillik</option>
              </select>
            </div>
            <div>
              <label className="label">Keyingi sana</label>
              <input type="date" className="input" value={form.nextDate} onChange={e => setForm({...form, nextDate: e.target.value})} required />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">Saqlash</button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Bekor</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onConfirm={async () => { if (deleteItem) { await recurringApi.delete(deleteItem.id); setDeleteItem(null); load(); } }}
        onClose={() => setDeleteItem(null)} title="O'chirishni tasdiqlang" message={`"${deleteItem?.description || deleteItem?.category}" o'chirilsinmi?`} />
    </div>
  );
}
