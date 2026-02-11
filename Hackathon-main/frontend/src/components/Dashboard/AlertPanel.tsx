import { motion, AnimatePresence } from 'framer-motion'
import type { FlaggedTransaction } from '../../lib/api'

interface AlertPanelProps {
  alerts: FlaggedTransaction[]
  onSimulateAttack: () => void
  isSimulating: boolean
}

export function AlertPanel({ alerts, onSimulateAttack, isSimulating }: AlertPanelProps) {
  return (
    <div style={{ width: 260, flexShrink: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-1)', fontFamily: 'Geist Mono, serif' }}>Live Alerts</div>
        <div style={{ fontSize: 11, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)', marginTop: 1 }}>Last 10 incidents</div>
      </div>

      {/* Alerts */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px 6px' }}>
        <AnimatePresence>
          {alerts.slice(0, 10).map((alert, i) => (
            <motion.div key={`${alert.account_id}-${i}`}
              initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              style={{ padding: '10px 12px', borderRadius: 7, marginBottom: 6,
                background: alert.status === 'BLOCKED' ? 'var(--danger-light)' : 'var(--warning-light)',
                border: `1px solid ${alert.status === 'BLOCKED' ? 'var(--danger-border)' : 'var(--warning-border)'}`,
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontFamily: 'Geist Mono, monospace', fontWeight: 500, color: alert.status === 'BLOCKED' ? 'var(--danger)' : 'var(--warning)' }}>{alert.account_id}</span>
                <span style={{ fontSize: 10, fontFamily: 'Geist Mono, monospace', color: alert.status === 'BLOCKED' ? 'var(--danger)' : 'var(--warning)' }}>{alert.status}</span>
              </div>
              <div style={{ fontSize: 11, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-3)' }}>Risk: {(alert.risk_score * 100).toFixed(0)}%</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 3, lineHeight: 1.4 }}>{alert.reason.split(';')[0]}</div>
            </motion.div>
          ))}
        </AnimatePresence>
        {alerts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 12, color: 'var(--ink-4)' }}>No alerts</div>
        )}
      </div>

      {/* Simulate button */}
      <div style={{ padding: '12px 12px 14px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <button onClick={onSimulateAttack} disabled={isSimulating}
          style={{
            width: '100%', padding: '9px 0', borderRadius: 7, border: '1px solid',
            borderColor: isSimulating ? 'var(--border)' : 'var(--danger-border)',
            background: isSimulating ? 'var(--bg-subtle)' : 'var(--danger-light)',
            color: isSimulating ? 'var(--ink-4)' : 'var(--danger)',
            fontSize: 12, fontFamily: 'Geist Mono, monospace', fontWeight: 500,
            cursor: isSimulating ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 0.15s',
          }}>
          {isSimulating ? (
            <><span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--ink-4)', borderTopColor: 'transparent', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Simulating...</>
          ) : '⚡ Simulate Bot Attack'}
        </button>
        <div style={{ fontSize: 10, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-5)', textAlign: 'center', marginTop: 5 }}>Injects 20 Raast bot transactions</div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
