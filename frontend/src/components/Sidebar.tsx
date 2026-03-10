import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

const navItems = [
  { path: '/',             label: 'Dashboard',    emoji: '🏠' },
  { path: '/accounts',    label: 'Accounts',     emoji: '💳' },
  { path: '/transactions',label: 'Transactions', emoji: '📋' },
  { path: '/transfers',   label: 'Transfers',    emoji: '🔄' },
  { path: '/debts',       label: 'Debts',        emoji: '💰' },
  { path: '/budget',      label: 'Budget',       emoji: '📊' },
  { path: '/analytics',   label: 'Analytics',    emoji: '📈' },
  { path: '/goals',       label: 'Goals',        emoji: '🎯' },
  { path: '/recurring',   label: 'Recurring',    emoji: '🔁' },
  { path: '/ai',          label: 'AI Insights',  emoji: '🤖' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem('darkMode') !== 'false');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('darkMode', String(dark));
  }, [dark]);

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark');
  }, []);

  const initials = (user?.username || 'U').slice(0, 2).toUpperCase();

  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg,#0d0d1a 0%,#09090f 100%)',
      borderRight: '1px solid rgba(255,255,255,0.055)',
      position: 'relative',
      flexShrink: 0,
    }}>
      {/* right glow line */}
      <div style={{ position:'absolute', right:0, top:'20%', bottom:'20%', width:'1px', background:'linear-gradient(180deg,transparent,rgba(99,102,241,0.5),transparent)', pointerEvents:'none' }} />

      {/* Logo */}
      <div style={{ padding:'1.25rem 1.1rem 1rem', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.65rem' }}>
          <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:'0.9rem', boxShadow:'0 0 18px rgba(99,102,241,0.55)', flexShrink:0 }}>
            F
          </div>
          <div>
            <p style={{ color:'#f1f5f9', fontWeight:700, fontSize:'0.95rem', lineHeight:1.2 }}>FinTrack</p>
            <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.65rem' }}>Finance Manager</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'0.6rem 0.6rem', overflowY:'auto' }}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.55rem 0.75rem',
              borderRadius: '0.75rem',
              fontSize: '0.82rem',
              fontWeight: isActive ? 600 : 400,
              textDecoration: 'none',
              marginBottom: '1px',
              transition: 'all 0.15s',
              color: isActive ? '#ffffff' : 'rgba(255,255,255,0.45)',
              background: isActive
                ? 'linear-gradient(135deg,rgba(99,102,241,0.28),rgba(168,85,247,0.18))'
                : 'transparent',
              border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              boxShadow: isActive ? '0 0 16px rgba(99,102,241,0.18)' : 'none',
            })}
          >
            <span style={{ fontSize:'1rem', lineHeight:1 }}>{item.emoji}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding:'0.6rem 0.6rem 1rem', display:'flex', flexDirection:'column', gap:'0.4rem' }}>
        {/* Dark toggle */}
        <button
          onClick={() => setDark(p => !p)}
          style={{ display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.5rem 0.75rem', borderRadius:'0.75rem', fontSize:'0.78rem', fontWeight:500, color:'rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', cursor:'pointer', transition:'all 0.2s', width:'100%', textAlign:'left' }}
        >
          <span style={{ fontSize:'0.9rem' }}>{dark ? '☀️' : '🌙'}</span>
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* User */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.55rem 0.75rem', borderRadius:'0.75rem', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'0.7rem', flexShrink:0 }}>
            {initials}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ color:'rgba(255,255,255,0.85)', fontSize:'0.75rem', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.username}</p>
            <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.63rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{ color:'rgba(255,255,255,0.25)', background:'none', border:'none', cursor:'pointer', fontSize:'0.85rem', padding:'0 2px', flexShrink:0 }}
            title="Sign out"
          >⏻</button>
        </div>
      </div>
    </aside>
  );
}
