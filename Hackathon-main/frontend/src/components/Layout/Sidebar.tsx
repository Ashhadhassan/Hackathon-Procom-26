import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MessageSquareWarning, ScanLine, Bot, Shield } from 'lucide-react'

interface SidebarProps { isAttacking?: boolean }

const NAV = [
  { to: '/',       icon: LayoutDashboard,      label: 'Command Center',      end: true  },
  { to: '/scan',   icon: ScanLine,             label: 'Transaction Scanner', end: false },
  { to: '/verify', icon: MessageSquareWarning, label: 'Phishing Shield',     end: false },
  { to: '/agent',  icon: Bot,                  label: 'Agent Interceptor',   end: false, isNew: true },
]

export function Sidebar({ isAttacking }: SidebarProps) {
  return (
    <aside style={{
      width: 220, flexShrink: 0, height: '100vh',
      background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Brand */}
      <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: isAttacking ? 'var(--danger)' : 'var(--cobalt)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-1)', lineHeight: 1.2, fontFamily: 'Geist Mono, serif' }}>Z-Shield AI</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'Geist Mono, monospace' }}>JS Bank · Zindigi</div>
          </div>
        </div>

        <div style={{
          marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '3px 10px', borderRadius: 20,
          background: isAttacking ? 'var(--danger-light)' : 'var(--success-light)',
          border: `1px solid ${isAttacking ? 'var(--danger-border)' : 'var(--success-border)'}`,
          fontSize: 11, fontFamily: 'Geist Mono, monospace',
          color: isAttacking ? 'var(--danger)' : 'var(--success)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}
            className={isAttacking ? 'pulse-fast' : 'pulse'} />
          {isAttacking ? 'THREAT ACTIVE' : 'ALL CLEAR'}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <div style={{ fontSize: 10, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)', padding: '6px 10px 4px', letterSpacing: '0.1em' }}>
          MODULES
        </div>
        {NAV.map(({ to, icon: Icon, label, end, isNew }) => (
          <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px',
            borderRadius: 6, fontSize: 13, fontWeight: isActive ? 500 : 400,
            color: isActive ? 'var(--cobalt)' : 'var(--ink-2)',
            background: isActive ? 'var(--cobalt-light)' : 'transparent',
            textDecoration: 'none', transition: 'all 0.12s',
          })}>
            <Icon size={14} />
            <span style={{ flex: 1 }}>{label}</span>
            {isNew && (
              <span style={{
                fontSize: 9, fontFamily: 'Geist Mono, monospace', padding: '1px 5px',
                borderRadius: 3, background: 'var(--cobalt-light)', color: 'var(--cobalt)',
                border: '1px solid var(--blue-border)',
              }}>NEW</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)', lineHeight: 1.9 }}>
          <div>PROCOM '26 Hackathon</div>
          <div>v1.0 · Demo Build</div>
        </div>
      </div>
    </aside>
  )
}
