import React, { useEffect, useState } from 'react';
import { accountsApi, AccountRequest } from '../api/accounts';
import { Account, AccountType } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { useForm } from 'react-hook-form';

const ACCOUNT_TYPES: AccountType[] = ['CHECKING', 'SAVINGS', 'CREDIT_CARD', 'CASH', 'INVESTMENT'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'RUB', 'UZS', 'JPY', 'CNY'];
const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899'];

const typeLabels: Record<AccountType,string> = { CHECKING:'Checking', SAVINGS:'Savings', CREDIT_CARD:'Credit Card', CASH:'Cash', INVESTMENT:'Investment' };
const typeIcons:  Record<AccountType,string> = { CHECKING:'🏦', SAVINGS:'💰', CREDIT_CARD:'💳', CASH:'💵', INVESTMENT:'📈' };

function CardVisual({ account }: { account: Account }) {
  const [hover, setHover] = useState(false);
  const color = account.color || '#6366f1';
  const last4 = String(Math.abs(account.id.split('-')[0].split('').reduce((a, c) => a + c.charCodeAt(0), 0))).slice(-4).padStart(4, '0');

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: `linear-gradient(135deg, ${color}ee, ${color}99 50%, #1a1030)`,
        borderRadius: '1.25rem',
        padding: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s',
        transform: hover ? 'translateY(-5px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hover ? `0 20px 50px ${color}55` : `0 6px 24px ${color}33`,
        cursor: 'default',
        minHeight: '160px',
      }}
    >
      {/* Decorative circles */}
      <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'120px', height:'120px', borderRadius:'50%', background:'rgba(255,255,255,0.09)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-20px', right:'25px', width:'75px', height:'75px', borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />

      {/* Top row */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'auto', position:'relative' }}>
        <div>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.65rem', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>{typeLabels[account.type]}</p>
          <p style={{ color:'white', fontWeight:700, fontSize:'0.95rem', marginTop:'2px' }}>{account.name}</p>
        </div>
        <span style={{ fontSize:'1.4rem' }}>{typeIcons[account.type]}</span>
      </div>

      {/* Balance */}
      <div style={{ marginTop:'1.1rem', marginBottom:'1rem', position:'relative' }}>
        <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'0.65rem', fontWeight:600, letterSpacing:'0.06em', marginBottom:'2px' }}>BALANCE</p>
        <p style={{ color:'white', fontSize:'1.5rem', fontWeight:800, lineHeight:1 }}>
          {account.currency} {Number(account.balance).toLocaleString()}
        </p>
      </div>

      {/* Bottom */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative' }}>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.7rem', letterSpacing:'0.15em' }}>•••• •••• •••• {last4}</p>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.65rem', fontWeight:600 }}>{account.currency}</p>
      </div>
    </div>
  );
}

export default function Accounts() {
  const [accounts, setAccounts]     = useState<Account[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AccountRequest>();

  const fetchAccounts = async () => {
    try { setAccounts(await accountsApi.getAll()); }
    catch(e) { console.error(e); }
    finally { setIsLoading(false); }
  };
  useEffect(() => { fetchAccounts(); }, []);

  const openCreate = () => {
    setEditingAccount(null);
    reset({ name:'', type:'CHECKING', currency:'USD', balance:0 });
    setSelectedColor(COLORS[0]);
    setIsModalOpen(true);
  };

  const openEdit = (a: Account) => {
    setEditingAccount(a);
    reset({ name:a.name, type:a.type, currency:a.currency, balance:a.balance });
    setSelectedColor(a.color || COLORS[0]);
    setIsModalOpen(true);
  };

  const onSubmit = async (data: AccountRequest) => {
    setIsSubmitting(true);
    try {
      const payload = { ...data, color: selectedColor };
      if (editingAccount) {
        const u = await accountsApi.update(editingAccount.id, payload);
        setAccounts(prev => prev.map(a => a.id === u.id ? u : a));
      } else {
        const c = await accountsApi.create(payload);
        setAccounts(prev => [c, ...prev]);
      }
      setIsModalOpen(false);
    } catch(e) { console.error(e); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deletingAccount) return;
    setIsSubmitting(true);
    try {
      await accountsApi.delete(deletingAccount.id);
      setAccounts(prev => prev.filter(a => a.id !== deletingAccount.id));
      setDeletingAccount(null);
    } catch(e) { console.error(e); }
    finally { setIsSubmitting(false); }
  };

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0);

  if (isLoading) return <LoadingSpinner className="h-64" />;

  return (
    <div style={{ padding:'1.75rem', minHeight:'100vh', background:'var(--bg)' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <div>
          <p style={{ color:'var(--text-3)', fontSize:'0.75rem', marginBottom:'4px' }}>All accounts</p>
          <h1 style={{ color:'var(--text)', fontSize:'1.6rem', fontWeight:800, lineHeight:1 }}>
            <span className="gradient-text">Accounts</span>
          </h1>
          <p style={{ color:'var(--text-3)', fontSize:'0.82rem', marginTop:'4px' }}>
            Total: <span style={{ color:'var(--text)', fontWeight:700 }}>${totalBalance.toLocaleString()}</span>
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Add Account</button>
      </div>

      {accounts.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:'4rem 2rem' }}>
          <p style={{ fontSize:'3rem', marginBottom:'1rem' }}>💳</p>
          <p style={{ color:'var(--text)', fontWeight:600, marginBottom:'0.5rem' }}>No accounts yet</p>
          <p style={{ color:'var(--text-3)', fontSize:'0.85rem', marginBottom:'1.5rem' }}>Add your first account to start tracking</p>
          <button onClick={openCreate} className="btn-primary">Add Account</button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1.25rem' }}>
          {accounts.map(acc => (
            <div key={acc.id} style={{ position:'relative' }}>
              <CardVisual account={acc} />
              {/* Action buttons */}
              <div style={{ position:'absolute', top:'0.75rem', right:'0.75rem', display:'flex', gap:'4px', zIndex:10 }}>
                <button
                  onClick={() => openEdit(acc)}
                  style={{ padding:'4px 8px', borderRadius:'6px', fontSize:'0.7rem', background:'rgba(0,0,0,0.4)', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.15)', cursor:'pointer', backdropFilter:'blur(6px)' }}
                >✏️</button>
                <button
                  onClick={() => setDeletingAccount(acc)}
                  style={{ padding:'4px 8px', borderRadius:'6px', fontSize:'0.7rem', background:'rgba(244,63,94,0.3)', color:'#fb7185', border:'1px solid rgba(244,63,94,0.3)', cursor:'pointer', backdropFilter:'blur(6px)' }}
                >🗑️</button>
              </div>
            </div>
          ))}

          {/* Add new card */}
          <div
            onClick={openCreate}
            style={{
              minHeight:'160px', borderRadius:'1.25rem', border:'2px dashed rgba(99,102,241,0.3)',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:'0.5rem', cursor:'pointer', transition:'all 0.2s',
              background:'rgba(99,102,241,0.04)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(99,102,241,0.6)'; (e.currentTarget as HTMLElement).style.background='rgba(99,102,241,0.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(99,102,241,0.3)'; (e.currentTarget as HTMLElement).style.background='rgba(99,102,241,0.04)'; }}
          >
            <div style={{ width:'44px', height:'44px', borderRadius:'14px', background:'rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', color:'#818cf8' }}>+</div>
            <p style={{ color:'#818cf8', fontWeight:600, fontSize:'0.85rem' }}>Add Account</p>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAccount ? 'Edit Account' : 'New Account'}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div>
            <label className="label">Account Name</label>
            <input {...register('name',{required:'Required'})} className="input" placeholder="e.g. Kapital Bank" />
            {errors.name && <p style={{ color:'#fb7185', fontSize:'0.75rem', marginTop:'4px' }}>{errors.name.message}</p>}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div>
              <label className="label">Type</label>
              <select {...register('type',{required:true})} className="input">
                {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{typeLabels[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Currency</label>
              <select {...register('currency',{required:true})} className="input">
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {!editingAccount && (
            <div>
              <label className="label">Initial Balance</label>
              <input {...register('balance',{required:true,valueAsNumber:true})} type="number" step="0.01" className="input" placeholder="0.00" />
            </div>
          )}
          <div>
            <label className="label">Card Color</label>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginTop:'4px' }}>
              {COLORS.map(col => (
                <button key={col} type="button" onClick={() => setSelectedColor(col)}
                  style={{ width:'32px', height:'32px', borderRadius:'50%', background:col, border: selectedColor===col ? `3px solid white` : '3px solid transparent', cursor:'pointer', transition:'transform 0.15s', transform: selectedColor===col ? 'scale(1.15)' : 'scale(1)', boxShadow: selectedColor===col ? `0 0 12px ${col}` : 'none' }}
                />
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', paddingTop:'0.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex:1 }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ flex:1 }}>
              {isSubmitting ? 'Saving...' : editingAccount ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingAccount} onClose={() => setDeletingAccount(null)} onConfirm={handleDelete}
        title="Delete Account" message={`Delete "${deletingAccount?.name}"? All transactions will also be deleted.`}
        isLoading={isSubmitting}
      />
    </div>
  );
}
