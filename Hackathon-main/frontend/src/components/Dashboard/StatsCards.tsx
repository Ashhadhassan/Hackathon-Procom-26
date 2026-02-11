import { motion } from 'framer-motion'

interface StatsCardsProps {
  activeThreats: number; blockedToday: number; tps: number; riskLevel: string
}

function Card({ label, value, sub, accent, delay, pulse }: { label: string; value: string | number; sub: string; accent: string; delay: number; pulse?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.3 }}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: '10px 10px 0 0' }} />
      <div style={{ fontSize: 10, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)', letterSpacing: '0.1em', marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 600, fontFamily: 'Geist Mono, monospace', lineHeight: 1, color: pulse ? accent : 'var(--ink-1)' }}
        className={pulse ? 'pulse-fast' : ''}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 5 }}>{sub}</div>
    </motion.div>
  )
}

export function StatsCards({ activeThreats, blockedToday, tps, riskLevel }: StatsCardsProps) {
  const rA = riskLevel === 'LOW' ? 'var(--success)' : riskLevel === 'MEDIUM' ? 'var(--warning)' : 'var(--danger)'
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
      <Card label="ACTIVE THREATS" value={activeThreats} sub="Bots currently tracked"
        accent={activeThreats > 0 ? 'var(--danger)' : 'var(--success)'} delay={0} pulse={activeThreats > 0} />
      <Card label="BLOCKED TODAY" value={blockedToday.toLocaleString()} sub="Transactions intercepted"
        accent="var(--cobalt)" delay={0.05} />
      <Card label="TRANSACTIONS / SEC" value={tps.toFixed(1)} sub="Current throughput"
        accent="var(--warning)" delay={0.1} />
      <Card label="THREAT LEVEL" value={riskLevel} sub="System risk assessment"
        accent={rA} delay={0.15} pulse={riskLevel === 'HIGH' || riskLevel === 'CRITICAL'} />
    </div>
  )
}
