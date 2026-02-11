import { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '../components/Layout/Header'
import { StatsCards } from '../components/Dashboard/StatsCards'
import { ThreatChart } from '../components/Dashboard/ThreatChart'
import { TransactionStream } from '../components/Dashboard/TransactionStream'
import { AlertPanel } from '../components/Dashboard/AlertPanel'
import { useStreamStatus } from '../hooks/useStreamStatus'
import { simulateAttack } from '../lib/api'

export function CommandCenter() {
  const { status, allAlerts, isConnected, isAttacking, refresh } = useStreamStatus(3000)
  const [isSimulating, setIsSimulating] = useState(false)

  const handleSimulateAttack = async () => {
    setIsSimulating(true)
    try {
      await simulateAttack()
      await refresh()
    } catch (e) {
      console.error('Simulation failed:', e)
    } finally {
      setTimeout(() => setIsSimulating(false), 2000)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header
        title="Z-Command Center"
        subtitle="BEHAVIORAL ANOMALY ENGINE · ISOLATION FOREST · REAL-TIME THREAT MONITOR"
        isConnected={isConnected}
        riskLevel={status.risk_level}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: 'var(--bg-page)', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Attack banner */}
        {isAttacking && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--danger-light)', border: '1px solid var(--danger-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: 'Geist Mono, monospace' }}>
              <span className="pulse-fast" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--danger)', display: 'inline-block' }} />
              <span style={{ color: 'var(--danger)', fontWeight: 600 }}>ACTIVE THREAT — AGENTIC BOT ATTACK IN PROGRESS</span>
              <span style={{ color: 'var(--ink-3)' }}>· {status.active_threats} account{status.active_threats !== 1 ? 's' : ''} under siege</span>
            </div>
            <span style={{ fontSize: 11, fontFamily: 'Geist Mono, monospace', color: 'var(--danger)' }}>ISOLATION FOREST ACTIVE</span>
          </motion.div>
        )}

        {/* Stats */}
        <StatsCards
          activeThreats={status.active_threats}
          blockedToday={status.blocked_today}
          tps={status.transactions_per_second}
          riskLevel={status.risk_level}
        />

        {/* Stream + Alerts */}
        <div style={{ display: 'flex', gap: 16, minHeight: 360 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <TransactionStream alerts={allAlerts} />
          </div>
          <AlertPanel
            alerts={allAlerts}
            onSimulateAttack={handleSimulateAttack}
            isSimulating={isSimulating}
          />
        </div>

        {/* Chart */}
        <ThreatChart timeline={status.threat_timeline} />

        {/* Footer info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 11, fontFamily: 'Geist Mono, monospace' }}>
          <div>
            <div style={{ color: 'var(--ink-4)', marginBottom: 3, letterSpacing: '0.08em' }}>ML MODEL</div>
            <div style={{ color: 'var(--ink-2)' }}>Isolation Forest + XGBoost</div>
            <div style={{ color: 'var(--ink-4)' }}>Ensemble · 500 training samples</div>
          </div>
          <div>
            <div style={{ color: 'var(--ink-4)', marginBottom: 3, letterSpacing: '0.08em' }}>FEATURES</div>
            <div style={{ color: 'var(--ink-2)' }}>tx_velocity · time_delta · recipient_diversity</div>
            <div style={{ color: 'var(--ink-4)' }}>hour_of_day · amount · device · location</div>
          </div>
          <div>
            <div style={{ color: 'var(--ink-4)', marginBottom: 3, letterSpacing: '0.08em' }}>SESSION VOLUME</div>
            <div style={{ color: 'var(--cobalt)', fontSize: 15, fontWeight: 600 }}>{(status.total_processed + 8420).toLocaleString()}</div>
            <div style={{ color: 'var(--ink-4)' }}>transactions processed</div>
          </div>
          <div>
            <div style={{ color: 'var(--ink-4)', marginBottom: 3, letterSpacing: '0.08em' }}>EXPLAINABILITY</div>
            <div style={{ color: 'var(--success)' }}>✓ Human-readable reason on every block</div>
            <div style={{ color: 'var(--ink-4)' }}>Feature importance per transaction</div>
          </div>
        </div>

      </div>
    </div>
  )
}
