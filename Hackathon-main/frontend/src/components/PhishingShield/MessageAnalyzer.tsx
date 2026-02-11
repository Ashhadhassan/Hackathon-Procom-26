import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { analyzeText } from '../../lib/api'
import type { PhishingResult } from '../../lib/api'
import { AnalysisResult } from './AnalysisResult'

const SAMPLES = [
  { label: 'Fake OTP Scam', text: 'URGENT: Your Zindigi account has been SUSPENDED due to suspicious activity. To restore access immediately, share your 6-digit OTP with our agent at 0312-1234567. Failure to comply within 1 hour will result in permanent closure.' },
  { label: 'Prize Fraud',   text: "Congratulations! You've been selected as JS Bank's lucky winner. You won PKR 500,000. To claim your prize, visit http://jsbankprize-verify.tk and verify your CNIC and account number." },
  { label: 'Normal Message', text: 'Dear customer, your monthly account statement for January 2026 is now available. Log in to the Zindigi app to view your statement. For assistance, call 021-111-747-747.' },
]

export function MessageAnalyzer() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<PhishingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = async () => {
    if (!text.trim()) return
    setLoading(true); setError(null); setResult(null)
    try { setResult(await analyzeText(text)) }
    catch (e: any) { setError('Analysis failed. Is the backend running on port 8000?') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Samples */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)', marginBottom: 8, letterSpacing: '0.08em' }}>LOAD SAMPLE</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {SAMPLES.map(s => (
            <button key={s.label} onClick={() => { setText(s.text); setResult(null) }}
              style={{ fontSize: 12, padding: '5px 12px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--cobalt)', cursor: 'pointer', fontFamily: 'Geist Mono, sans-serif' }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 12, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ padding: '10px 14px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', fontSize: 11, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)' }}>
          Message input · paste suspicious SMS, email or WhatsApp
        </div>
        <textarea value={text} onChange={e => { setText(e.target.value); setResult(null) }}
          placeholder="Paste message here..."
          rows={6}
          style={{ width: '100%', padding: '14px 16px', background: 'var(--bg-card)', color: 'var(--ink-1)', border: 'none', outline: 'none', fontSize: 13, fontFamily: 'Geist Mono, sans-serif', lineHeight: 1.6, resize: 'none' }} />
        <div style={{ padding: '10px 14px', background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)' }}>{text.length} chars</span>
          <button onClick={analyze} disabled={loading || !text.trim()}
            style={{
              padding: '7px 18px', borderRadius: 6, border: '1px solid',
              borderColor: !text.trim() || loading ? 'var(--border)' : 'var(--blue-border)',
              background: !text.trim() || loading ? 'var(--bg-subtle)' : 'var(--cobalt-light)',
              color: !text.trim() || loading ? 'var(--ink-4)' : 'var(--cobalt)',
              fontSize: 12, fontFamily: 'Geist Mono, monospace', fontWeight: 500,
              cursor: !text.trim() || loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
            }}>
            {loading
              ? <><span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--cobalt)', borderTopColor: 'transparent', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Analyzing...</>
              : 'Analyze Message'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--danger-light)', border: '1px solid var(--danger-border)', fontSize: 12, color: 'var(--danger)', fontFamily: 'Geist Mono, monospace', marginBottom: 12 }}>
          {error}
        </div>
      )}

      <AnimatePresence>
        {result && <AnalysisResult result={result} />}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
