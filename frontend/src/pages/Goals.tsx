import React, { useEffect, useState } from 'react';
import { goalsApi } from '../api/goals';
import { SavingsGoal } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';

const GOAL_ICONS  = ['🎯','🏠','🚗','✈️','💍','📱','💻','🎓','💰','🏖️','🎮','👶'];
const GOAL_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16'];

export default function Goals() {
  const [goals, setGoals]           = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [selGoal, setSelGoal]       = useState<SavingsGoal | null>(null);
  const [delGoal, setDelGoal]       = useState<SavingsGoal | null>(null);
  const [deposit, setDeposit]       = useState('');
  const [form, setForm]             = useState({ name:'', targetAmount:'', currency:'USD', targetDate:'', color:'#6366f1', icon:'🎯' });

  const load = async () => { try { setGoals(await goalsApi.getAll()); } finally { setIsLoading(false); } };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, targetAmount: parseFloat(form.targetAmount) };
    if (selGoal) await goalsApi.update(selGoal.id, data);
    else await goalsApi.create(data);
    setShowModal(false); setSelGoal(null);
    setForm({ name:'', targetAmount:'', currency:'USD', targetDate:'', color:'#6366f1', icon:'🎯' });
    load();
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selGoal) return;
    await goalsApi.deposit(selGoal.id, parseFloat(deposit));
    setShowDeposit(false); setDeposit(''); setSelGoal(null); load();
  };

  const openEdit = (g: SavingsGoal) => {
    setSelGoal(g);
    setForm({ name:g.name, targetAmount:String(g.targetAmount), currency:g.currency, targetDate:g.targetDate||'', color:g.color, icon:g.icon });
    setShowModal(true);
  };

  const totalSaved  = goals.reduce((s,g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s,g) => s + g.targetAmount, 0);

  if (isLoading) return <LoadingSpinner className="h-64" />;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }} className="p-4 md:p-7">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <div>
          <h1 style={{ fontSize:'1.6rem', fontWeight:800, lineHeight:1 }}><span className="gradient-text">Maqsadlar</span></h1>
          <p style={{ color:'var(--text-3)', fontSize:'0.82rem', marginTop:'4px' }}>Moliyaviy maqsadlaringizni kuzating</p>
        </div>
        <button onClick={() => { setSelGoal(null); setShowModal(true); }} className="btn-primary">+ Yangi maqsad</button>
      </div>

      {/* Stats */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label:'Jami maqsadlar', value:String(goals.length), color:'#818cf8' },
            { label:'Jami yig\'ilgan', value:`$${totalSaved.toLocaleString()}`, color:'#34d399' },
            { label:'Umumiy maqsad', value:`$${totalTarget.toLocaleString()}`, color:'var(--text)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign:'center', padding:'1rem' }}>
              <p style={{ fontSize:'0.72rem', color:'var(--text-3)', marginBottom:'0.3rem', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>{s.label}</p>
              <p style={{ fontSize:'1.4rem', fontWeight:800, color:s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {goals.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:'4rem 2rem' }}>
          <p style={{ fontSize:'3rem', marginBottom:'1rem' }}>🎯</p>
          <p style={{ color:'var(--text)', fontWeight:600, marginBottom:'0.5rem' }}>Hali maqsad yo'q</p>
          <p style={{ color:'var(--text-3)', fontSize:'0.85rem', marginBottom:'1.5rem' }}>Birinchi moliyaviy maqsadingizni qo'shing</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">Maqsad qo'shish</button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:'1.25rem' }}>
          {goals.map(g => {
            const pct = Math.min(g.progressPercent, 100);
            const done = pct >= 100;
            return (
              <div key={g.id} className="card" style={{ padding:0, overflow:'hidden', border:`1px solid ${g.color}20` }}>
                {/* Gradient header */}
                <div style={{ background:`linear-gradient(135deg,${g.color}cc,${g.color}66,rgba(10,10,20,0.8))`, padding:'1.25rem', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:'-20px', right:'-20px', width:'80px', height:'80px', borderRadius:'50%', background:'rgba(255,255,255,0.08)', pointerEvents:'none' }} />
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                    <div>
                      <span style={{ fontSize:'2rem' }}>{g.icon}</span>
                      <p style={{ color:'white', fontWeight:700, fontSize:'1rem', marginTop:'4px' }}>{g.name}</p>
                      {g.targetDate && <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.7rem', marginTop:'2px' }}>Muddat: {format(new Date(g.targetDate),'dd MMM yyyy')}</p>}
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                      <button onClick={() => { setSelGoal(g); setShowDeposit(true); }}
                        style={{ padding:'4px 8px', borderRadius:'6px', fontSize:'0.68rem', fontWeight:600, background:'rgba(255,255,255,0.2)', color:'white', border:'1px solid rgba(255,255,255,0.3)', cursor:'pointer', backdropFilter:'blur(6px)' }}>
                        + Qo'shish
                      </button>
                      <div style={{ display:'flex', gap:'3px' }}>
                        <button onClick={() => openEdit(g)} style={{ padding:'3px 6px', borderRadius:'5px', fontSize:'0.65rem', background:'rgba(255,255,255,0.15)', color:'white', border:'none', cursor:'pointer' }}>✏️</button>
                        <button onClick={() => setDelGoal(g)} style={{ padding:'3px 6px', borderRadius:'5px', fontSize:'0.65rem', background:'rgba(244,63,94,0.3)', color:'#fca5a5', border:'none', cursor:'pointer' }}>🗑️</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress section */}
                <div style={{ padding:'1.1rem 1.25rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                    <span style={{ fontWeight:700, fontSize:'0.9rem', color:g.color }}>{g.currency} {g.currentAmount.toLocaleString()}</span>
                    <span style={{ fontSize:'0.8rem', color:'var(--text-4)' }}>{g.currency} {g.targetAmount.toLocaleString()}</span>
                  </div>
                  <div style={{ height:'10px', borderRadius:'999px', background:'var(--surface-3)', overflow:'hidden', position:'relative' }}>
                    <div style={{
                      height:'100%', width:`${pct}%`, borderRadius:'999px',
                      background:`linear-gradient(90deg,${g.color},${g.color}bb)`,
                      boxShadow:`0 0 8px ${g.color}60`,
                      transition:'width 1s cubic-bezier(0.34,1.56,0.64,1)',
                      position:'relative',
                    }}>
                      {!done && <div className="shimmer-bar" style={{ position:'absolute', inset:0, borderRadius:'999px' }} />}
                    </div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:'5px' }}>
                    <span style={{ fontSize:'0.7rem', color:'var(--text-4)' }}>{pct.toFixed(1)}% bajarildi</span>
                    {done && <span style={{ fontSize:'0.7rem', color:'#34d399', fontWeight:600 }}>✨ Maqsadga erishdingiz!</span>}
                  </div>
                  {done && (
                    <div style={{ marginTop:'8px', padding:'6px', borderRadius:'10px', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', textAlign:'center', fontSize:'0.8rem', color:'#34d399', fontWeight:600 }}>
                      🎉 Tabriklaymiz!
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setSelGoal(null); }} title={selGoal ? 'Maqsadni tahrirlash' : 'Yangi maqsad'}>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div><label className="label">Maqsad nomi</label><input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required placeholder="Masalan: Yangi mashina" /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div><label className="label">Summa</label><input type="number" className="input" value={form.targetAmount} onChange={e=>setForm({...form,targetAmount:e.target.value})} required min="1" step="0.01" /></div>
            <div><label className="label">Valyuta</label>
              <select className="input" value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})}>
                {['USD','EUR','UZS','RUB','GBP'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">Muddat (ixtiyoriy)</label><input type="date" className="input" value={form.targetDate} onChange={e=>setForm({...form,targetDate:e.target.value})} /></div>
          <div>
            <label className="label">Rang</label>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginTop:'4px' }}>
              {GOAL_COLORS.map(c=>(
                <button type="button" key={c} onClick={()=>setForm({...form,color:c})}
                  style={{ width:'28px',height:'28px',borderRadius:'50%',background:c,border:form.color===c?'3px solid white':'3px solid transparent',cursor:'pointer',transition:'transform 0.15s',transform:form.color===c?'scale(1.2)':'scale(1)',boxShadow:form.color===c?`0 0 10px ${c}`:'' }} />
              ))}
            </div>
          </div>
          <div>
            <label className="label">Ikonka</label>
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginTop:'4px' }}>
              {GOAL_ICONS.map(icon=>(
                <button type="button" key={icon} onClick={()=>setForm({...form,icon})}
                  style={{ width:'36px',height:'36px',borderRadius:'10px',fontSize:'1.1rem',display:'flex',alignItems:'center',justifyContent:'center',background:form.icon===icon?'rgba(99,102,241,0.2)':'var(--surface-2)',border:form.icon===icon?'2px solid rgba(99,102,241,0.5)':'2px solid transparent',cursor:'pointer' }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', paddingTop:'0.5rem' }}>
            <button type="submit" className="btn-primary" style={{ flex:1 }}>{selGoal?'Saqlash':'Yaratish'}</button>
            <button type="button" onClick={()=>setShowModal(false)} className="btn-secondary" style={{ flex:1 }}>Bekor</button>
          </div>
        </form>
      </Modal>

      {/* Deposit Modal */}
      <Modal isOpen={showDeposit} onClose={()=>{setShowDeposit(false);setSelGoal(null);}} title={`"${selGoal?.name}" ga pul qo'shish`}>
        <form onSubmit={handleDeposit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div>
            <label className="label">Miqdor ({selGoal?.currency})</label>
            <input type="number" className="input" value={deposit} onChange={e=>setDeposit(e.target.value)} required min="0.01" step="0.01" placeholder="0.00" autoFocus />
          </div>
          <div style={{ display:'flex', gap:'0.75rem' }}>
            <button type="submit" className="btn-primary" style={{ flex:1 }}>Qo'shish</button>
            <button type="button" onClick={()=>setShowDeposit(false)} className="btn-secondary" style={{ flex:1 }}>Bekor</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!delGoal} onConfirm={async()=>{ if(delGoal){await goalsApi.delete(delGoal.id);setDelGoal(null);load();}}}
        onClose={()=>setDelGoal(null)} title="Maqsadni o'chirish" message={`"${delGoal?.name}" o'chirilsinmi?`} />
    </div>
  );
}
