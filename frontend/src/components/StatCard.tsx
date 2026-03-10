import React, { useEffect, useRef, useState } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  color: 'blue' | 'green' | 'red' | 'purple' | 'amber' | 'orange';
  trend?: number;
}

const C: Record<string, { grad: string; border: string; glow: string; icon: string; text: string }> = {
  blue:   { grad:'rgba(99,102,241,0.12)',  border:'#6366f1', glow:'rgba(99,102,241,0.25)',  icon:'rgba(99,102,241,0.18)',  text:'#818cf8' },
  green:  { grad:'rgba(16,185,129,0.10)',  border:'#10b981', glow:'rgba(16,185,129,0.25)',  icon:'rgba(16,185,129,0.18)',  text:'#34d399' },
  red:    { grad:'rgba(244,63,94,0.10)',   border:'#f43f5e', glow:'rgba(244,63,94,0.25)',   icon:'rgba(244,63,94,0.18)',   text:'#fb7185' },
  purple: { grad:'rgba(168,85,247,0.10)',  border:'#a855f7', glow:'rgba(168,85,247,0.25)',  icon:'rgba(168,85,247,0.18)',  text:'#c084fc' },
  amber:  { grad:'rgba(245,158,11,0.10)',  border:'#f59e0b', glow:'rgba(245,158,11,0.25)',  icon:'rgba(245,158,11,0.18)',  text:'#fbbf24' },
  orange: { grad:'rgba(249,115,22,0.10)',  border:'#f97316', glow:'rgba(249,115,22,0.25)',  icon:'rgba(249,115,22,0.18)',  text:'#fb923c' },
};

function useCountUp(target: number, ms = 1000) {
  const [n, setN] = useState(0);
  const raf = useRef<number>();
  useEffect(() => {
    if (!isFinite(target) || target <= 0) { setN(target); return; }
    const t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / ms, 1);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, ms]);
  return n;
}

export default function StatCard({ title, value, subtitle, icon, color, trend }: StatCardProps) {
  const c = C[color] || C.blue;
  const raw = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  const prefix = value.match(/^[^0-9]*/)?.[0] || '';
  const animated = useCountUp(raw);
  const display = raw > 0 ? `${prefix}${animated.toLocaleString()}` : value;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: c.grad,
        border: `1px solid ${c.border}22`,
        borderTop: `2px solid ${c.border}`,
        borderRadius: '1.25rem',
        padding: '1.25rem 1.4rem',
        boxShadow: `0 4px 24px ${c.glow}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow=`0 14px 40px ${c.glow}`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow=`0 4px 24px ${c.glow}`; }}
    >
      <div style={{ position:'absolute', top:'-20px', right:'-20px', width:'80px', height:'80px', borderRadius:'50%', background:`radial-gradient(circle, ${c.border}35, transparent 70%)`, pointerEvents:'none' }} />
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', position:'relative' }}>
        <div>
          <p style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', color:c.text, marginBottom:'0.5rem' }}>{title}</p>
          <p style={{ fontSize:'1.55rem', fontWeight:800, color:'var(--text)', lineHeight:1.1, marginBottom:'0.2rem' }}>{display}</p>
          {subtitle && <p style={{ fontSize:'0.73rem', color:'var(--text-4)' }}>{subtitle}</p>}
          {trend !== undefined && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:'2px', marginTop:'0.35rem', fontSize:'0.68rem', fontWeight:700, padding:'2px 7px', borderRadius:'999px', background: trend>=0?'rgba(16,185,129,0.15)':'rgba(244,63,94,0.15)', color: trend>=0?'#34d399':'#fb7185' }}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        <div style={{ width:'42px', height:'42px', borderRadius:'13px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', background:c.icon, boxShadow:`0 0 18px ${c.glow}` }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
