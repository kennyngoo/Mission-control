'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/tasks', emoji: '✅', label: 'Tasks' },
  { href: '/projects', emoji: '📁', label: 'Projects' },
  { href: '/calendar', emoji: '📅', label: 'Calendar' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: '240px',
        minWidth: '240px',
        backgroundColor: '#141820',
        borderRight: '1px solid #1e2435',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
      }}
    >
      {/* Logo / branding */}
      <div
        style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid #1e2435',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🐙</div>
        <div
          style={{
            border: '1px solid #2a3145',
            padding: '6px 10px',
            letterSpacing: '0.15em',
            fontSize: '11px',
            fontWeight: 700,
            color: '#94a3b8',
            textTransform: 'uppercase',
            fontFamily: 'monospace',
            marginBottom: '12px',
          }}
        >
          MISSION CONTROL
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: '11px',
              color: '#22c55e',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontFamily: 'monospace',
              fontWeight: 600,
            }}
          >
            TAKOYAKI ONLINE
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 0', flex: 1 }}>
        <div
          style={{
            fontSize: '10px',
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            padding: '8px 20px 4px',
            fontWeight: 600,
          }}
        >
          Navigation
        </div>

        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 20px',
                margin: '1px 8px',
                borderRadius: '6px',
                textDecoration: 'none',
                backgroundColor: isActive ? '#1e2942' : 'transparent',
                color: isActive ? '#e2e8f0' : '#94a3b8',
                fontSize: '14px',
                transition: 'background-color 0.15s, color 0.15s',
                position: 'relative',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>{item.emoji}</span>
                <span>{item.label}</span>
              </span>
              {isActive && (
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#7c3aed',
                    flexShrink: 0,
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid #1e2435',
          fontSize: '11px',
          color: '#334155',
          fontFamily: 'monospace',
        }}
      >
        v0.1.0 · openclaw
      </div>
    </aside>
  );
}
