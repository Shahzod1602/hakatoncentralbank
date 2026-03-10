import React, { useEffect, useRef, useState } from 'react';
import { aiApi } from '../api/ai';
import { AiInsight, HealthScore } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { currencyApi } from '../api/currency';

const FLAGS: Record<string,string> = { USD:'🇺🇸',EUR:'🇪🇺',GBP:'🇬🇧',UZS:'🇺🇿',RUB:'🇷🇺',KZT:'🇰🇿',JPY:'🇯🇵',CNY:'🇨🇳',TRY:'🇹🇷',AED:'🇦🇪' };
const CURRENCIES = ['USD','EUR','UZS','RUB','GBP','KZT','JPY','CNY','TRY'];

const scoreColor = (s:number) => s>=80?'#10b981':s>=60?'#f59e0b':s>=40?'#f97316':'#ef4444';
const insightStyle: Record<string,{bg:string;border:string;icon:string}> = {
  WARNING:{ bg:'rgba(245,158,11,0.08)',  border:'#f59e0b', icon:'#fbbf24' },
  SUCCESS:{ bg:'rgba(16,185,129,0.08)',  border:'#10b981', icon:'#34d399' },
  INFO:   { bg:'rgba(99,102,241,0.08)',  border:'#6366f1', icon:'#818cf8' },
};

function ScoreRing({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const [dash, setDash] = useState(0);
  useEffect(() => {
    setTimeout(() => setDash((score / 100) * circ), 100);
  }, [score, circ]);
  const c = scoreColor(score);
  return (
    <div style={{ position:'relative', width:'150px', height:'150px', margin:'0 auto' }}>
      <svg width="150" height="150" viewBox="0 0 120 120" style={{ transform:'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={c} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition:'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)', filter:`drop-shadow(0 0 8px ${c})` }} />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <p style={{ fontSize:'2.2rem', fontWeight:800, color:c, lineHeight:1 }}>{score}</p>
        <p style={{ fontSize:'1rem', fontWeight:700, color:c }}>{score>=80?'A':score>=60?'B':score>=40?'C':'D'}</p>
      </div>
    </div>
  );
}

export default function AiInsights() {
  const [insights, setInsights]     = useState<AiInsight[]>([]);
  const [health, setHealth]         = useState<HealthScore | null>(null);
  const [rates, setRates]           = useState<Record<string,number>>({});
  const [base, setBase]             = useState('USD');
  const [isLoading, setIsLoading]   = useState(true);
  const [desc, setDesc]             = useState('');
  const [aiRes, setAiRes]           = useState<{category:string;confidence:number}|null>(null);
  const [busy, setBusy]             = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const [ins,hs,cr] = await Promise.all([aiApi.getInsights(),aiApi.getHealthScore(),currencyApi.getRates('USD')]);
      setInsights(ins); setHealth(hs); setRates(cr.rates);
    } finally { setIsLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const handleCategorize = async () => {
    if (!desc.trim()) return;
    setBusy(true);
    try { setAiRes(await aiApi.categorize(desc)); } finally { setBusy(false); }
  };

  const loadRates = async (b:string) => {
    setBase(b);
    const cr = await currencyApi.getRates(b);
    setRates(cr.rates);
  };

  if (isLoading) return <LoadingSpinner className="h-64" />;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }} className="p-4 md:p-7">
      <div style={{ marginBottom:'1.5rem' }}>
        <h1 style={{ fontSize:'1.6rem', fontWeight:800, lineHeight:1 }}><span className="gradient-text">AI Tahlil</span></h1>
        <p style={{ color:'var(--text-3)', fontSize:'0.82rem', marginTop:'4px' }}>Aqlli maslahatlar, moliyaviy sog'liq va valyuta kurslari</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {/* Health Score */}
        {health && (
          <div className="card" style={{ textAlign:'center' }}>
            <p style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:'1rem' }}>Moliyaviy Sog'liq Balli</p>
            <ScoreRing score={health.score} />
            <p style={{ fontWeight:700, fontSize:'1.1rem', color:scoreColor(health.score), marginTop:'0.75rem' }}>{health.status}</p>
            <div style={{ marginTop:'1rem', display:'flex', flexDirection:'column', gap:'6px', textAlign:'left' }}>
              {health.tips.map((tip,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'8px', padding:'8px 10px', borderRadius:'10px', background:'var(--surface-2)', border:'1px solid var(--border)' }}>
                  <span style={{ color:'#818cf8', flexShrink:0, marginTop:'1px' }}>💡</span>
                  <p style={{ fontSize:'0.75rem', color:'var(--text-3)', lineHeight:1.4 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="md:col-span-2">
          <p style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:'0.75rem' }}>Ogohlantirish va Maslahatlar</p>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {insights.map((ins,i)=>{
              const s = insightStyle[ins.type] || insightStyle.INFO;
              return (
                <div key={i} style={{ padding:'1rem', borderRadius:'1rem', background:s.bg, borderLeft:`3px solid ${s.border}`, border:`1px solid ${s.border}20` }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem' }}>
                    <span style={{ fontSize:'1.4rem', flexShrink:0 }}>{ins.icon}</span>
                    <div>
                      <p style={{ fontWeight:700, fontSize:'0.88rem', color:'var(--text)', marginBottom:'3px' }}>{ins.title}</p>
                      <p style={{ fontSize:'0.8rem', color:'var(--text-3)', lineHeight:1.5 }}>{ins.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Categorizer */}
      <div className="card" style={{ marginBottom:'1.25rem' }}>
        <p style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:'0.75rem' }}>🤖 AI Kategoriya Aniqlash</p>
        {/* Terminal style */}
        <div style={{ background:'#0a0a0f', border:'1px solid rgba(99,102,241,0.25)', borderRadius:'0.875rem', padding:'0.875rem 1rem', fontFamily:'monospace' }}>
          <p style={{ color:'rgba(99,102,241,0.6)', fontSize:'0.7rem', marginBottom:'0.5rem' }}>$ fintrack ai --categorize</p>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <span style={{ color:'#34d399', fontSize:'0.8rem', flexShrink:0 }}>›</span>
            <input
              ref={inputRef}
              className={!desc && !busy ? 'cursor-blink' : ''}
              value={desc}
              onChange={e=>setDesc(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleCategorize()}
              placeholder="Domino's Pizza, Uber ride, Netflix..."
              style={{ background:'transparent', border:'none', outline:'none', flex:1, color:'#f1f5f9', fontSize:'0.85rem', fontFamily:'monospace' }}
            />
            <button onClick={handleCategorize} disabled={busy}
              style={{ padding:'4px 12px', borderRadius:'6px', fontSize:'0.75rem', fontWeight:600, background:'rgba(99,102,241,0.2)', color:'#818cf8', border:'1px solid rgba(99,102,241,0.3)', cursor:'pointer', flexShrink:0 }}>
              {busy ? '...' : 'Run'}
            </button>
          </div>
          {aiRes && (
            <div style={{ marginTop:'0.75rem', paddingTop:'0.75rem', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ color:'rgba(99,102,241,0.7)', fontSize:'0.7rem', marginBottom:'4px' }}>RESULT:</p>
              <p style={{ color:'#34d399', fontFamily:'monospace', fontSize:'0.9rem' }}>
                category: <span style={{ color:'#f1f5f9', fontWeight:700 }}>"{aiRes.category}"</span>
                <span style={{ color:'rgba(255,255,255,0.3)', marginLeft:'1rem', fontSize:'0.75rem' }}>confidence: {(aiRes.confidence*100).toFixed(0)}%</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Currency Rates */}
      <div className="card">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
          <p style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', color:'var(--text-3)' }}>💱 Valyuta Kurslari</p>
          <select className="input" style={{ width:'auto' }} value={base} onChange={e=>loadRates(e.target.value)}>
            {CURRENCIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:'0.75rem' }}>
          {CURRENCIES.filter(c=>c!==base).map(cur=>(
            <div key={cur} style={{ padding:'0.75rem', borderRadius:'0.875rem', background:'var(--surface-2)', border:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <span style={{ fontSize:'1.2rem' }}>{FLAGS[cur]||'🏳️'}</span>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:'0.85rem', color:'var(--text)' }}>{cur}</p>
                <p style={{ fontSize:'0.8rem', color:'#34d399', fontWeight:600 }}>
                  {rates[cur]?.toFixed(['JPY','UZS','KZT','RUB'].includes(cur)?1:4)||'—'}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize:'0.7rem', color:'var(--text-4)', marginTop:'0.75rem' }}>1 {base} = ko'rsatilgan miqdor</p>
      </div>
    </div>
  );
}
