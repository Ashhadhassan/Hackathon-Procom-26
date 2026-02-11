import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

interface ThreatChartProps { timeline: { time: string; threats: number; total: number }[] }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', boxShadow: 'var(--shadow-md)', fontSize: 12, fontFamily: 'Geist Mono, monospace' }}>
      <div style={{ color: 'var(--ink-3)', marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => <div key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></div>)}
    </div>
  )
}

export function ThreatChart({ timeline }: ThreatChartProps) {
  const data = timeline.length > 0 ? timeline : Array.from({ length: 12 }, () => ({ time: `--:--`, threats: 0, total: 0 }))
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 20px 12px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-1)', fontFamily: 'Geist Mono, serif' }}>Threat Timeline</div>
          <div style={{ fontSize: 11, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)', marginTop: 2 }}>Last 20 detection events · live</div>
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 11, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 2, background: 'var(--cobalt-mid)', display: 'inline-block', borderRadius: 1 }} />Total TX</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 2, background: 'var(--danger)', display: 'inline-block', borderRadius: 1 }} />Threats</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.15} /><stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2} /><stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: 'var(--ink-4)', fontSize: 10, fontFamily: 'Geist Mono' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--ink-4)', fontSize: 10, fontFamily: 'Geist Mono' }} axisLine={false} tickLine={false} width={24} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="total" name="Total TX" stroke="#3B82F6" strokeWidth={1.5} fill="url(#gT)" />
          <Area type="monotone" dataKey="threats" name="Threats" stroke="#EF4444" strokeWidth={2} fill="url(#gD)" />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
