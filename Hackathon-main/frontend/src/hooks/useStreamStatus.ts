import { useState, useEffect, useCallback } from 'react'
import { getStreamStatus } from '../lib/api'
import type { StreamStatus, FlaggedTransaction } from '../lib/api'

const DEFAULT_STATUS: StreamStatus = {
  active_threats: 0,
  blocked_today: 127,
  transactions_per_second: 0,
  risk_level: 'LOW',
  recent_alerts: [],
  threat_timeline: [],
  total_processed: 0,
}

export function useStreamStatus(pollInterval = 3000) {
  const [status, setStatus] = useState<StreamStatus>(DEFAULT_STATUS)
  const [allAlerts, setAllAlerts] = useState<FlaggedTransaction[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isAttacking, setIsAttacking] = useState(false)

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getStreamStatus()
      setStatus(data)
      setIsConnected(true)
      if (data.recent_alerts.length > 0) {
        setAllAlerts(prev => {
          const newAlerts = data.recent_alerts.filter(
            a => !prev.some(p => p.account_id === a.account_id && p.timestamp === a.timestamp)
          )
          return [...newAlerts, ...prev].slice(0, 50)
        })
      }
      setIsAttacking(data.risk_level === 'HIGH' || data.risk_level === 'CRITICAL')
    } catch {
      setIsConnected(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, pollInterval)
    return () => clearInterval(interval)
  }, [fetchStatus, pollInterval])

  return { status, allAlerts, isConnected, isAttacking, refresh: fetchStatus }
}
