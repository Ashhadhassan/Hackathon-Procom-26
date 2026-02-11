import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '../components/Layout/Header'
import { ScanLine, CheckCircle, XCircle, AlertTriangle, ChevronDown } from 'lucide-react'
import axios from 'axios'

const TX_TYPES = ["Raast Transfer", "Easypaisa", "JazzCash", "IBFT", "Card Payment", "Mobile Top-up", "Utility Bill"]
const BANKS = ["HBL", "MCB", "UBL", "Meezan Bank", "Allied Bank", "Bank Alfalah", "Easypaisa", "JazzCash", "JS Bank"]
const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta"]

const PRESETS = [
  {
    label: "Normal Transfer",
    desc: "Routine daytime Raast payment",
    data: { account_id: "PK-ACC0042", amount: 15000, transaction_type: "Raast Transfer", recipient_bank: "HBL", sender_city: "Karachi", recipient_city: "Karachi", tx_count_last_5s: 1, time_delta_ms: 180000, hour_of_day: 14, unique_recipients_last_10tx: 6, is_new_device: false, location_change: false }
  },
  {
    label: "Bot Attack",
    desc: "Agentic drain — 20 tx in 2 seconds",
    data: { account_id: "PK-ACC0055", amount: 5000, transaction_type: "Raast Transfer", recipient_bank: "Easypaisa", sender_city: "Karachi", recipient_city: "Lahore", tx_count_last_5s: 20, time_delta_ms: 80, hour_of_day: 3, unique_recipients_last_10tx: 1, is_new_device: true, location_change: true }
  },
  {
    label: "Account Takeover",
    desc: "New device + city change",
    data: { account_id: "PK-ACC0031", amount: 95000, transaction_type: "IBFT", recipient_bank: "MCB", sender_city: "Karachi", recipient_city: "Islamabad", tx_count_last_5s: 3, time_delta_ms: 5000, hour_of_day: 2, unique_recipients_last_10tx: 2, is_new_device: true, location_change: true }
  },
  {
    label: "Card Testing",
    desc: "Micro-transactions testing card validity",
    data: { account_id: "PK-ACC0018", amount: 10, transaction_type: "Card Payment", recipient_bank: "Bank Alfalah", sender_city: "Lahore", recipient_city: "Lahore", tx_count_last_5s: 8, time_delta_ms: 400, hour_of_day: 16, unique_recipients_last_10tx: 1, is_new_device: false, location_change: false }
  },
]

const RISK_CONFIG: Record<string, { color: string; bg: string; border: string; icon: any; label: string }> = {
  LOW:      { color: 'var(--success)', bg: 'var(--success-light)', border: 'var(--success-border)', icon: CheckCircle,  label: 'APPROVE' },
  MEDIUM:   { color: 'var(--warning)', bg: 'var(--warning-light)', border: 'var(--warning-border)', icon: AlertTriangle, label: 'MONITOR' },
  HIGH:     { color: 'var(--danger)',  bg: 'var(--danger-light)',  border: 'var(--danger-border)', icon: XCircle,       label: 'FLAG'    },
  CRITICAL: { color: 'var(--danger)',  bg: 'var(--danger-light)',              border: 'var(--danger-border)', icon: XCircle,       label: 'BLOCK'   },
}

interface FormData {
  account_id: string; amount: number; transaction_type: string; recipient_bank: string
  sender_city: string; recipient_city: string; tx_count_last_5s: number
  time_delta_ms: number; hour_of_day: number; unique_recipients_last_10tx: number
  is_new_device: boolean; location_change: boolean
}

const DEFAULT_FORM: FormData = PRESETS[0].data

export function TransactionScorer() {
  const [form, setForm] = useState<FormData>(DEFAULT_FORM)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof FormData, v: any) => setForm(f => ({ ...f, [k]: v }))

  const analyze = async () => {
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await axios.post('/api/score-transaction', form)
      setResult(res.data)
    } catch {
      setError('Backend not reachable. Start the FastAPI server on port 8000.')
    } finally { setLoading(false) }
  }

  const cfg = result ? (RISK_CONFIG[result.risk_label] || RISK_CONFIG.LOW) : null
  const Icon = cfg?.icon

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header title="Transaction Scanner" subtitle="ENSEMBLE ML · ISOLATION FOREST + XGBOOST · REAL-TIME SCORING" isConnected={true} riskLevel={result?.risk_label} />

      <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: 'var(--bg-page)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          {/* Presets */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)', letterSpacing: '0.08em', marginBottom: 8 }}>LOAD SCENARIO</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => { setForm(p.data); setResult(null) }}
                  style={{
                    fontSize: 12, padding: '6px 14px', borderRadius: 5, border: '1px solid var(--border)',
                    background: 'var(--bg-card)', color: 'var(--cobalt)',
                    cursor: 'pointer', fontFamily: 'Geist Mono, sans-serif', textAlign: 'left',
                  }}>
                  <div style={{ fontWeight: 500 }}>{p.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'Geist Mono, monospace', marginTop: 1 }}>{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Two columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Form */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontWeight: 600, color: 'var(--ink-1)', fontFamily: 'Geist Mono, serif', marginBottom: 16, fontSize: 15 }}>
                Transaction Details
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <Field label="Account ID">
                  <input value={form.account_id} onChange={e => set('account_id', e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Amount (PKR)">
                  <input type="number" value={form.amount} onChange={e => set('amount', Number(e.target.value))} style={inputStyle} />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <Field label="Transaction Type">
                  <SelectField value={form.transaction_type} onChange={v => set('transaction_type', v)} options={TX_TYPES} />
                </Field>
                <Field label="Recipient Bank">
                  <SelectField value={form.recipient_bank} onChange={v => set('recipient_bank', v)} options={BANKS} />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <Field label="Sender City">
                  <SelectField value={form.sender_city} onChange={v => set('sender_city', v)} options={CITIES} />
                </Field>
                <Field label="Recipient City">
                  <SelectField value={form.recipient_city} onChange={v => set('recipient_city', v)} options={CITIES} />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                <Field label="TX in last 5s">
                  <input type="number" value={form.tx_count_last_5s} onChange={e => set('tx_count_last_5s', Number(e.target.value))} style={inputStyle} />
                </Field>
                <Field label="Hour of Day">
                  <input type="number" min={0} max={23} value={form.hour_of_day} onChange={e => set('hour_of_day', Number(e.target.value))} style={inputStyle} />
                </Field>
                <Field label="Unique Recipients">
                  <input type="number" value={form.unique_recipients_last_10tx} onChange={e => set('unique_recipients_last_10tx', Number(e.target.value))} style={inputStyle} />
                </Field>
              </div>

              <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                <Toggle label="New Device" value={form.is_new_device} onChange={v => set('is_new_device', v)} />
                <Toggle label="Location Change" value={form.location_change} onChange={v => set('location_change', v)} />
              </div>

              <button onClick={analyze} disabled={loading}
                style={{
                  width: '100%', padding: '9px 0', borderRadius: 6, border: '1px solid',
                  borderColor: loading ? 'var(--border)' : 'var(--blue-border)',
                  background: loading ? 'var(--bg-subtle)' : 'var(--cobalt-light)',
                  color: loading ? 'var(--ink-4)' : 'var(--cobalt)',
                  fontSize: 12, fontFamily: 'Geist Mono, monospace', fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  transition: 'all 0.15s',
                }}>
                {loading
                  ? <><span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--cobalt)', borderTopColor: 'transparent', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Analyzing...</>
                  : <><ScanLine size={13} />Scan Transaction</>}
              </button>

              {error && (
                <div style={{ marginTop: 10, padding: '9px 12px', borderRadius: 6, background: 'var(--danger-light)', border: '1px solid var(--danger-border)', fontSize: 11, color: 'var(--danger)', fontFamily: 'Geist Mono, monospace' }}>
                  {error}
                </div>
              )}
            </div>

            {/* Result panel */}
            <div>
              <AnimatePresence mode="wait">
                {!result && !loading && (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
                      height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      boxShadow: 'var(--shadow-sm)',
                    }}>
                    <ScanLine size={28} style={{ color: 'var(--ink-5)', marginBottom: 10 }} />
                    <div style={{ fontSize: 12, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)' }}>Select a scenario and scan</div>
                  </motion.div>
                )}

                {result && cfg && Icon && (
                  <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                    {/* Verdict */}
                    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10, padding: '16px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Icon size={24} style={{ color: cfg.color }} />
                          <div>
                            <div style={{ fontSize: 11, fontFamily: 'Geist Mono, monospace', color: cfg.color, letterSpacing: '0.08em' }}>{result.risk_label} RISK · {cfg.label}</div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-1)', fontFamily: 'Geist Mono, serif' }}>
                              {result.is_fraud ? 'Fraud Detected' : 'Transaction Safe'}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 28, fontWeight: 600, fontFamily: 'Geist Mono, monospace', color: cfg.color, lineHeight: 1 }}>{(result.fraud_probability * 100).toFixed(0)}%</div>
                          <div style={{ fontSize: 10, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)' }}>FRAUD PROB.</div>
                        </div>
                      </div>
                      <div style={{ height: 5, borderRadius: 3, background: 'var(--ink-5)', overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${result.fraud_probability * 100}%` }} transition={{ delay: 0.2, duration: 0.7 }}
                          style={{ height: '100%', background: cfg.color, borderRadius: 3 }} />
                      </div>
                    </div>

                    {/* Attack type */}
                    {result.is_fraud && (
                      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ fontSize: 10, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)', letterSpacing: '0.1em', marginBottom: 4 }}>ATTACK TYPE</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: cfg.color, fontFamily: 'Geist Mono, monospace' }}>{result.attack_type}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.5 }}>{result.reason}</div>
                      </div>
                    )}

                    {/* Feature importance */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ fontSize: 10, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)', letterSpacing: '0.1em', marginBottom: 10 }}>FEATURE IMPORTANCE</div>
                      {(result.feature_importance || []).map((f: any, i: number) => {
                        const barColor = f.score >= 0.7 ? 'var(--danger)' : f.score >= 0.4 ? 'var(--warning)' : 'var(--success)'
                        return (
                          <div key={f.label} style={{ marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 11, fontFamily: 'Geist Mono, monospace' }}>
                              <span style={{ color: 'var(--ink-2)' }}>{f.label}</span>
                              <span style={{ color: 'var(--ink-4)' }}>{f.value}</span>
                            </div>
                            <div style={{ height: 4, borderRadius: 2, background: 'var(--ink-5)', overflow: 'hidden' }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${f.score * 100}%` }} transition={{ delay: 0.1 * i, duration: 0.5 }}
                                style={{ height: '100%', borderRadius: 2, background: barColor }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Model breakdown */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ fontSize: 10, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)', letterSpacing: '0.1em', marginBottom: 10 }}>MODEL BREAKDOWN</div>
                      {[
                        { label: 'Isolation Forest', val: result.model_breakdown?.isolation_forest, bold: false },
                        { label: 'XGBoost',          val: result.model_breakdown?.xgboost,          bold: false },
                        { label: 'Ensemble Score',   val: result.model_breakdown?.ensemble,         bold: true  },
                      ].filter(m => m.val !== null && m.val !== undefined).map(m => (
                        <div key={m.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, fontFamily: 'Geist Mono, monospace' }}>
                          <span style={{ color: m.bold ? 'var(--ink-1)' : 'var(--ink-3)' }}>{m.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 80, height: 4, borderRadius: 2, background: 'var(--ink-5)', overflow: 'hidden' }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${m.val * 100}%` }} transition={{ delay: 0.3, duration: 0.6 }}
                                style={{ height: '100%', borderRadius: 2, background: m.bold ? cfg.color : 'var(--ink-4)' }} />
                            </div>
                            <span style={{ color: m.bold ? cfg.color : 'var(--ink-3)', minWidth: 30, textAlign: 'right' }}>{(m.val * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recommendation */}
                    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10, padding: '12px 16px' }}>
                      <div style={{ fontSize: 10, fontFamily: 'Geist Mono, monospace', color: cfg.color, letterSpacing: '0.1em', marginBottom: 4 }}>RECOMMENDED ACTION</div>
                      <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Geist Mono, monospace', color: cfg.color }}>{result.recommendation}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px',
  background: 'var(--bg-subtle)', color: 'var(--ink-1)',
  border: '1px solid var(--border)', borderRadius: 5,
  fontSize: 12, fontFamily: 'Geist Mono, monospace', outline: 'none',
  boxSizing: 'border-box',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontFamily: 'Geist Mono, monospace', color: 'var(--ink-4)', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  )
}

function SelectField({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, appearance: 'none', paddingRight: 28, cursor: 'pointer' }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={11} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ink-4)' }} />
    </div>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: 'Geist Mono, monospace', color: value ? 'var(--cobalt)' : 'var(--ink-3)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
      <div style={{
        width: 32, height: 18, borderRadius: 9, position: 'relative', transition: 'all 0.2s',
        background: value ? 'var(--cobalt-light)' : 'var(--bg-subtle)',
        border: `1px solid ${value ? 'var(--blue-border)' : 'var(--border)'}`,
      }}>
        <div style={{
          position: 'absolute', top: 2, width: 12, height: 12, borderRadius: '50%', transition: 'left 0.2s',
          left: value ? 'calc(100% - 14px)' : 2,
          background: value ? 'var(--cobalt)' : 'var(--ink-4)',
        }} />
      </div>
      {label}
    </button>
  )
}
