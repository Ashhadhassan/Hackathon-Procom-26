import { Wifi, WifiOff } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
  isConnected: boolean
  riskLevel?: string
}

const RISK_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  LOW:      { color: 'var(--success)', bg: 'var(--success-light)', border: 'var(--success-border)' },
  MEDIUM:   { color: 'var(--warning)', bg: 'var(--warning-light)', border: 'var(--warning-border)' },
  HIGH:     { color: 'var(--danger)',  bg: 'var(--danger-light)',  border: 'var(--danger-border)' },
  CRITICAL: { color: 'var(--danger)',  bg: 'var(--danger-light)',              border: 'var(--danger-border)' },
}

export function Header({ title, subtitle, isConnected, riskLevel }: HeaderProps) {
  const risk = riskLevel ? (RISK_STYLE[riskLevel] ?? null) : null

  return (
    <header style={{
      height: 54, flexShrink: 0, padding: '0 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <h1 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-1)', fontFamily: 'Geist Mono, serif' }}>{title}</h1>
        {subtitle && (
          <span style={{ fontSize: 10, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)', letterSpacing: '0.06em' }}>
            {subtitle}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {risk && riskLevel && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 9px', borderRadius: 4,
            background: risk.bg, border: `1px solid ${risk.border}`,
            fontSize: 11, fontFamily: 'Geist Mono, monospace', color: risk.color, fontWeight: 500,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }}
              className={(riskLevel === 'HIGH' || riskLevel === 'CRITICAL') ? 'pulse-fast' : ''} />
            {riskLevel}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: 'Geist Mono, monospace', color: isConnected ? 'var(--success)' : 'var(--danger)' }}>
          {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
          {isConnected ? 'LIVE' : 'OFFLINE'}
        </div>

        <div style={{ fontSize: 12, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)' }}>
          {new Date().toLocaleTimeString('en-PK', { hour12: false })}
        </div>
      </div>
    </header>
  )
}
