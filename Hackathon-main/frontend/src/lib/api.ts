import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

export interface Transaction {
  account_id: string
  amount: number
  timestamp: string
  tx_count_last_5s: number
  time_delta_ms: number
  hour_of_day: number
  unique_recipients_last_10tx: number
  recipient_id: string
}

export interface FlaggedTransaction {
  account_id: string
  amount: number
  timestamp: string
  risk_score: number
  reason: string
  status: string
}

export interface StreamStatus {
  active_threats: number
  blocked_today: number
  transactions_per_second: number
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  recent_alerts: FlaggedTransaction[]
  threat_timeline: { time: string; threats: number; total: number }[]
  total_processed: number
}

export interface PhishingResult {
  is_phishing: boolean
  confidence: number
  risk_label: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  markers: string[]
  explanation: string
  recommendation: string
}

export interface SimulateAttackResult {
  message: string
  injected_count: number
  flagged: FlaggedTransaction[]
}

export const getStreamStatus = (): Promise<StreamStatus> =>
  api.get('/stream-status').then(r => r.data)

export const analyzeText = (text: string): Promise<PhishingResult> =>
  api.post('/analyze-text', { text }).then(r => r.data)

export const simulateAttack = (): Promise<SimulateAttackResult> =>
  api.post('/simulate-attack').then(r => r.data)

export default api
