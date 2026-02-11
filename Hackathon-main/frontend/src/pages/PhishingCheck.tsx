import { Header } from '../components/Layout/Header'
import { MessageAnalyzer } from '../components/PhishingShield/MessageAnalyzer'

export function PhishingCheck() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header
        title="Phishing Shield"
        subtitle="LLM-POWERED MESSAGE ANALYSIS · GROQ LLAMA 3 · FRAUD PATTERN DETECTION"
        isConnected={true}
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: 'var(--bg-page)' }}>
        <MessageAnalyzer />
      </div>
    </div>
  )
}
