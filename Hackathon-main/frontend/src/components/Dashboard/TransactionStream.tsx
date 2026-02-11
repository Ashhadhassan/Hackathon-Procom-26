import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { FlaggedTransaction } from '../../lib/api'

interface TransactionStreamProps { alerts: FlaggedTransaction[] }

function riskColor(score: number) {
  if (score >= 0.75) return 'var(--danger)'
  if (score >= 0.5)  return 'var(--warning)'
  return 'var(--cobalt)'
}

export function TransactionStream({ alerts }: TransactionStreamProps) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [alerts.length])

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-1)', fontFamily: 'Geist Mono, serif' }}>Flagged Transactions</div>
          <div style={{ fontSize: 11, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)', marginTop: 1 }}>Isolation Forest · XGBoost Ensemble</div>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 9px', borderRadius: 4,
          background: alerts.length > 0 ? 'var(--danger-light)' : 'var(--bg-subtle)',
          border: `1px solid ${alerts.length > 0 ? 'var(--danger-border)' : 'var(--border)'}`,
          fontSize: 11, fontFamily: 'Geist Mono, monospace',
          color: alerts.length > 0 ? 'var(--danger)' : 'var(--ink-4)',
        }}>
          {alerts.length > 0 && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} className="pulse-fast" />}
          {alerts.length} FLAGGED
        </div>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '120px 110px 90px 80px 1fr',
        padding: '8px 18px', borderBottom: '1px solid var(--border)',
        fontSize: 10, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)', letterSpacing: '0.08em',
        flexShrink: 0, background: 'var(--bg-subtle)',
      }}>
        <span>ACCOUNT</span><span>AMOUNT (PKR)</span><span>RISK</span><span>STATUS</span><span>REASON</span>
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {alerts.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8 }}>
            <div style={{ fontSize: 13, color: 'var(--ink-4)' }}>No flagged activity</div>
            <div style={{ fontSize: 12, color: 'var(--ink-5)', fontFamily: 'Geist Mono, monospace' }}>Click "Simulate Attack" to run demo</div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {alerts.map((alert, i) => {
              const color = riskColor(alert.risk_score)
              return (
                <motion.div key={`${alert.account_id}-${alert.timestamp}-${i}`}
                  initial={{ opacity: 0, backgroundColor: 'rgba(239,68,68,0.08)' }}
                  animate={{ opacity: 1, backgroundColor: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-surface)' }}
                  transition={{ duration: 0.4 }}
                  style={{ display: 'grid', gridTemplateColumns: '120px 110px 90px 80px 1fr', padding: '10px 18px', borderBottom: '1px solid var(--border)', alignItems: 'center', fontSize: 12 }}>
                  <span style={{ fontFamily: 'Geist Mono, monospace', color: 'var(--ink-1)', fontWeight: 500 }}>{alert.account_id}</span>
                  <span style={{ fontFamily: 'Geist Mono, monospace', color: 'var(--ink-2)' }}>{alert.amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${alert.risk_score * 100}%`, background: color, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, color }}>{(alert.risk_score * 100).toFixed(0)}%</span>
                  </div>
                  <span style={{
                    fontFamily: 'Geist Mono, monospace', fontSize: 11, padding: '2px 6px', borderRadius: 3,
                    background: alert.status === 'BLOCKED' ? 'var(--danger-light)' : 'var(--warning-light)',
                    color: alert.status === 'BLOCKED' ? 'var(--danger)' : 'var(--warning)',
                    border: `1px solid ${alert.status === 'BLOCKED' ? 'var(--danger-border)' : 'var(--warning-border)'}`,
                    display: 'inline-block', width: 'fit-content',
                  }}>{alert.status}</span>
                  <span style={{ color: 'var(--ink-3)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={alert.reason}>{alert.reason}</span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
        <div ref={endRef} />
      </div>
    </div>
  )
}
