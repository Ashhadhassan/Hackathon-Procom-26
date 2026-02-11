import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/Layout/Sidebar'
import { CommandCenter } from './pages/CommandCenter'
import { PhishingCheck } from './pages/PhishingCheck'
import { TransactionScorer } from './pages/TransactionScorer'
import { AgentSandbox } from './pages/AgentSandbox'
import { useStreamStatus } from './hooks/useStreamStatus'

function AppShell() {
  const { isAttacking } = useStreamStatus(3000)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-page)' }}>
      <Sidebar isAttacking={isAttacking} />
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Routes>
          <Route path="/" element={<CommandCenter />} />
          <Route path="/verify" element={<PhishingCheck />} />
          <Route path="/scan" element={<TransactionScorer />} />
          <Route path="/agent" element={<AgentSandbox />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
