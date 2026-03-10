import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const mainTabs = [
  { path: '/',             label: 'Home',         emoji: '🏠' },
  { path: '/transactions', label: 'Transactions',  emoji: '📋' },
  { path: '/accounts',     label: 'Accounts',      emoji: '💳' },
  { path: '/budget',       label: 'Budget',        emoji: '📊' },
];

const moreItems = [
  { path: '/analytics',   label: 'Analytics',    emoji: '📈' },
  { path: '/goals',       label: 'Goals',         emoji: '🎯' },
  { path: '/debts',       label: 'Debts',         emoji: '💰' },
  { path: '/transfers',   label: 'Transfers',     emoji: '🔄' },
  { path: '/recurring',   label: 'Recurring',     emoji: '🔁' },
  { path: '/ai',          label: 'AI Insights',   emoji: '🤖' },
];

export default function BottomNav() {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* Slide-up "More" sheet */}
      {showMore && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowMore(false)}
        >
          <div
            className="absolute bottom-16 left-0 right-0 mx-2 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg,#0d0d1a 0%,#09090f 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4">
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
                More
              </p>
              <div className="grid grid-cols-3 gap-2">
                {moreItems.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => setShowMore(false)}
                    style={({ isActive }) => ({
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.75rem 0.5rem',
                      borderRadius: '0.875rem',
                      textDecoration: 'none',
                      transition: 'all 0.15s',
                      background: isActive
                        ? 'linear-gradient(135deg,rgba(99,102,241,0.28),rgba(168,85,247,0.18))'
                        : 'rgba(255,255,255,0.04)',
                      border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.05)',
                    })}
                  >
                    {({ isActive }) => (
                      <>
                        <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{item.emoji}</span>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                          textAlign: 'center',
                          lineHeight: 1.2,
                        }}>
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{
          background: 'linear-gradient(180deg,#0d0d1a 0%,#09090f 100%)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-center justify-around h-16">
          {mainTabs.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === '/'}
              className="flex flex-col items-center gap-1 flex-1 h-full justify-center"
              style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? '#6366f1' : 'rgba(255,255,255,0.4)',
                transition: 'color 0.15s',
              })}
            >
              {({ isActive }) => (
                <>
                  <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{tab.emoji}</span>
                  <span style={{
                    fontSize: '0.6rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#6366f1' : 'rgba(255,255,255,0.4)',
                  }}>
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          {/* More button */}
          <button
            onClick={() => setShowMore(p => !p)}
            className="flex flex-col items-center gap-1 flex-1 h-full justify-center"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: showMore ? '#6366f1' : 'rgba(255,255,255,0.4)',
              transition: 'color 0.15s',
            }}
          >
            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>☰</span>
            <span style={{
              fontSize: '0.6rem',
              fontWeight: showMore ? 600 : 400,
              color: showMore ? '#6366f1' : 'rgba(255,255,255,0.4)',
            }}>
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
