import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { analyticsApi } from '../api/analytics';
import { AnalyticsSummary, CategorySummary, TimeSeriesDataPoint, CalendarDayData } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import clsx from 'clsx';

const PIE_COLORS = ['#6366f1','#10b981','#f59e0b','#f43f5e','#8b5cf6','#06b6d4','#f97316','#ec4899','#14b8a6','#84cc16'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'rgba(13,13,22,0.96)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:'0.75rem', padding:'0.6rem 0.9rem', backdropFilter:'blur(20px)' }}>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color:p.color||'#f1f5f9', fontSize:'0.82rem', fontWeight:600 }}>${Number(p.value).toLocaleString()}</p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [summary, setSummary]         = useState<AnalyticsSummary | null>(null);
  const [categoryData, setCategoryData] = useState<CategorySummary[]>([]);
  const [tsData, setTsData]           = useState<TimeSeriesDataPoint[]>([]);
  const [calData, setCalData]         = useState<CalendarDayData[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [dateRange, setDateRange]     = useState({
    startDate: format(startOfMonth(subMonths(new Date(),5)),'yyyy-MM-dd'),
    endDate:   format(endOfMonth(new Date()),'yyyy-MM-dd'),
  });
  const [catType, setCatType] = useState<'INCOME'|'EXPENSE'>('EXPENSE');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sum,cats,ts,cal] = await Promise.all([
        analyticsApi.getSummary(dateRange.startDate, dateRange.endDate),
        analyticsApi.getByCategory(catType, dateRange.startDate, dateRange.endDate),
        analyticsApi.getTimeSeries('DAY', dateRange.startDate, dateRange.endDate),
        analyticsApi.getCalendar(new Date().getFullYear(), new Date().getMonth()+1),
      ]);
      setSummary(sum); setCategoryData(cats); setTsData(ts.data); setCalData(cal.days);
    } finally { setIsLoading(false); }
  };
  useEffect(()=>{ fetchData(); },[dateRange,catType]);

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const calMap = Object.fromEntries(calData.map(d=>[d.date,d]));

  const calIntensity = (net: number) => {
    if (net>500) return { bg:'rgba(16,185,129,0.7)', text:'white' };
    if (net>0)   return { bg:'rgba(16,185,129,0.3)', text:'#34d399' };
    if (net<-500)return { bg:'rgba(244,63,94,0.7)',  text:'white' };
    if (net<0)   return { bg:'rgba(244,63,94,0.3)',  text:'#fb7185' };
    return { bg:'var(--surface-2)', text:'var(--text-4)' };
  };

  const tsChart = tsData.map(d=>({ date:format(new Date(d.date),'MMM d'), income:Number(d.income), expense:Number(d.expense), net:Number(d.net) }));

  if (isLoading) return <LoadingSpinner className="h-64" />;

  return (
    <div style={{ padding:'1.75rem', minHeight:'100vh', background:'var(--bg)' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <div>
          <h1 style={{ fontSize:'1.6rem', fontWeight:800 }}><span className="gradient-text">Analytics</span></h1>
          <p style={{ color:'var(--text-3)', fontSize:'0.82rem', marginTop:'4px' }}>Moliyaviy ma'lumotlaringizni vizuallashtiring</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <input type="date" className="input" style={{ width:'auto',fontSize:'0.8rem' }} value={dateRange.startDate} onChange={e=>setDateRange(p=>({...p,startDate:e.target.value}))} />
          <span style={{ color:'var(--text-4)', fontSize:'0.8rem' }}>—</span>
          <input type="date" className="input" style={{ width:'auto',fontSize:'0.8rem' }} value={dateRange.endDate} onChange={e=>setDateRange(p=>({...p,endDate:e.target.value}))} />
        </div>
      </div>

      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.25rem' }}>
        {[
          { label:'Total Income',  val: Number(summary?.totalIncome||0),  color:'#34d399', bg:'rgba(16,185,129,0.1)',  border:'#10b981' },
          { label:'Total Expense', val: Number(summary?.totalExpense||0), color:'#fb7185', bg:'rgba(244,63,94,0.1)',   border:'#f43f5e' },
          { label:'Net Balance',   val: Number(summary?.netBalance||0),   color:'#818cf8', bg:'rgba(99,102,241,0.1)',  border:'#6366f1' },
        ].map(s=>(
          <div key={s.label} style={{ padding:'1.1rem 1.25rem', borderRadius:'1.25rem', background:s.bg, border:`1px solid ${s.border}25`, borderTop:`2px solid ${s.border}` }}>
            <p style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', color:s.color, marginBottom:'0.5rem' }}>{s.label}</p>
            <p style={{ fontSize:'1.6rem', fontWeight:800, color:'var(--text)' }}>${s.val.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', marginBottom:'1.25rem' }}>
        {/* Pie Chart */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
            <p style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--text)' }}>Kategoriya bo'yicha</p>
            <div style={{ display:'flex', gap:'3px', padding:'3px', borderRadius:'0.625rem', background:'var(--surface-2)', border:'1px solid var(--border)' }}>
              {(['EXPENSE','INCOME'] as const).map(t=>(
                <button key={t} onClick={()=>setCatType(t)}
                  style={{ padding:'4px 10px', borderRadius:'8px', fontSize:'0.72rem', fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                    background: catType===t ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'transparent',
                    color: catType===t ? 'white' : 'var(--text-3)', border:'none' }}>
                  {t==='EXPENSE'?'Xarajat':'Daromad'}
                </button>
              ))}
            </div>
          </div>
          {categoryData.length === 0 ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'200px', color:'var(--text-4)', fontSize:'0.85rem' }}>Ma'lumot yo'q</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="amount" nameKey="category">
                    {categoryData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v:number)=>[`$${v.toLocaleString()}`,'Sum']}
                    contentStyle={{ background:'rgba(13,13,22,0.96)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:'0.75rem', backdropFilter:'blur(20px)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginTop:'0.5rem' }}>
                {categoryData.map((d,i)=>(
                  <span key={d.category} style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'3px 8px', borderRadius:'999px', fontSize:'0.68rem', fontWeight:600, background:`${PIE_COLORS[i%PIE_COLORS.length]}20`, color:PIE_COLORS[i%PIE_COLORS.length], border:`1px solid ${PIE_COLORS[i%PIE_COLORS.length]}30` }}>
                    <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:PIE_COLORS[i%PIE_COLORS.length], flexShrink:0 }} />
                    {d.category}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Area Chart */}
        <div className="card">
          <p style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--text)', marginBottom:'1rem' }}>Daromad vs Xarajat</p>
          {tsChart.length === 0 ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'200px', color:'var(--text-4)', fontSize:'0.85rem' }}>Ma'lumot yo'q</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={tsChart.slice(-30)} margin={{ top:5,right:5,left:-20,bottom:0 }}>
                <defs>
                  <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize:9, fill:'var(--text-4)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize:9, fill:'var(--text-4)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#gInc)" dot={false} />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fill="url(#gExp)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Net Trend */}
        <div className="card">
          <p style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--text)', marginBottom:'1rem' }}>Sof balans trendi</p>
          {tsChart.length === 0 ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'200px', color:'var(--text-4)', fontSize:'0.85rem' }}>Ma'lumot yo'q</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={tsChart.slice(-30)} margin={{ top:5,right:5,left:-20,bottom:0 }}>
                <defs>
                  <linearGradient id="gNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize:9, fill:'var(--text-4)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize:9, fill:'var(--text-4)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="net" stroke="#6366f1" strokeWidth={2} fill="url(#gNet)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Calendar Heatmap */}
        <div className="card">
          <p style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--text)', marginBottom:'1rem' }}>
            Kunlik faollik — {MONTH_NAMES[now.getMonth()]} {now.getFullYear()}
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'4px' }}>
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=>(
              <div key={d} style={{ textAlign:'center', fontSize:'0.65rem', color:'var(--text-4)', fontWeight:600, padding:'2px 0' }}>{d}</div>
            ))}
            {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
            {Array.from({length:daysInMonth},(_,i)=>{
              const day = i+1;
              const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const dd = calMap[dateStr];
              const net = dd ? Number(dd.net) : 0;
              const isToday = day === now.getDate();
              const style = calIntensity(net);
              return (
                <div key={day} title={dd?`Daromad: $${Number(dd.income).toFixed(0)}\nXarajat: $${Number(dd.expense).toFixed(0)}`:'Tranzaksiya yo\'q'}
                  style={{ aspectRatio:'1', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', fontWeight:600, background:style.bg, color:style.text, outline: isToday?'2px solid #6366f1':'none', outlineOffset:'1px', transition:'transform 0.15s', cursor:'default' }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='scale(1.15)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='scale(1)'}
                >{day}</div>
              );
            })}
          </div>
          <div style={{ display:'flex', gap:'1rem', marginTop:'0.75rem' }}>
            {[{col:'rgba(16,185,129,0.5)',label:'Daromad'},{col:'rgba(244,63,94,0.5)',label:'Xarajat'},{col:'var(--surface-2)',label:'Faoliyat yo\'q'}].map(l=>(
              <div key={l.label} style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'0.68rem', color:'var(--text-4)' }}>
                <div style={{ width:'10px', height:'10px', borderRadius:'3px', background:l.col, flexShrink:0 }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Account Breakdown */}
      {summary?.accountBalances && summary.accountBalances.length > 0 && (
        <div className="card">
          <p style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--text)', marginBottom:'1rem' }}>Hisob taqsimoti</p>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['Hisob','Balans','Daromad','Xarajat','Sof'].map(h=>(
                    <th key={h} style={{ padding:'0.5rem 0.75rem', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-3)', textAlign: h==='Hisob'?'left':'right' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.accountBalances.map(acc=>{
                  const net = Number(acc.income) - Number(acc.expense);
                  return (
                    <tr key={acc.accountId} style={{ borderBottom:'1px solid var(--border)' }}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--surface-2)'}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                      <td style={{ padding:'0.6rem 0.75rem' }}>
                        <p style={{ fontWeight:600, fontSize:'0.85rem', color:'var(--text)' }}>{acc.accountName}</p>
                        <p style={{ fontSize:'0.7rem', color:'var(--text-4)' }}>{acc.currency}</p>
                      </td>
                      <td style={{ textAlign:'right', padding:'0.6rem 0.75rem', fontWeight:700, fontSize:'0.85rem', color:'var(--text)' }}>${Number(acc.balance).toLocaleString()}</td>
                      <td style={{ textAlign:'right', padding:'0.6rem 0.75rem', fontWeight:700, fontSize:'0.85rem', color:'#34d399' }}>+${Number(acc.income).toLocaleString()}</td>
                      <td style={{ textAlign:'right', padding:'0.6rem 0.75rem', fontWeight:700, fontSize:'0.85rem', color:'#fb7185' }}>-${Number(acc.expense).toLocaleString()}</td>
                      <td style={{ textAlign:'right', padding:'0.6rem 0.75rem', fontWeight:700, fontSize:'0.85rem', color: net>=0?'#818cf8':'#fb7185' }}>${net.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
