import { motion } from 'framer-motion'
import type { PhishingResult } from '../../lib/api'

interface Props { result: PhishingResult }

const CFG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  LOW:      { color: 'var(--success)', bg: 'var(--success-light)', border: 'var(--success-border)', label: 'Safe' },
  MEDIUM:   { color: 'var(--warning)', bg: 'var(--warning-light)', border: 'var(--warning-border)', label: 'Suspicious' },
  HIGH:     { color: 'var(--danger)',  bg: 'var(--danger-light)',  border: 'var(--danger-border)', label: 'Phishing' },
  CRITICAL: { color: 'var(--danger)',  bg: 'var(--danger-light)',              border: 'var(--danger-border)', label: 'Phishing' },
}

export function AnalysisResult({ result }: Props) {
  const cfg = CFG[result.risk_label] ?? CFG.LOW
  const pct = Math.round(result.confidence * 100)

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-3">
      {/* Verdict card */}
      <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10, padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: 'Geist Mono, monospace', color: cfg.color, letterSpacing: '0.08em', marginBottom: 3 }}>{result.risk_label} RISK</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink-1)', fontFamily: 'Geist Mono, serif' }}>
              {result.is_phishing ? 'Phishing Detected' : 'Message Appears Safe'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 30, fontWeight: 600, fontFamily: 'Geist Mono, monospace', color: cfg.color, lineHeight: 1 }}>{pct}%</div>
            <div style={{ fontSize: 10, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)' }}>CONFIDENCE</div>
          </div>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'var(--ink-5)', overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.2, duration: 0.7 }}
            style={{ height: '100%', background: cfg.color, borderRadius: 3 }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Markers */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
          <div style={{ fontSize: 10, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)', letterSpacing: '0.1em', marginBottom: 10 }}>FRAUD MARKERS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {result.markers.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--ink-2)' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, marginTop: 4, flexShrink: 0 }} />
                {m}
              </motion.div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Explanation */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', flex: 1 }}>
            <div style={{ fontSize: 10, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)', letterSpacing: '0.1em', marginBottom: 6 }}>AI ANALYSIS</div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6 }}>{result.explanation}</div>
          </div>
          {/* Recommendation */}
          <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontFamily: 'Geist Mono, monospace', color: cfg.color, letterSpacing: '0.1em', marginBottom: 6 }}>RECOMMENDATION</div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6 }}>{result.recommendation}</div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: 11, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)' }}>
        Powered by Llama 3.3 · Groq API · Z-Shield NLP Engine
      </div>
    </motion.div>
  )
}
