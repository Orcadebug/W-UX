'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Session {
  id: string
  appVersion: string
  startedAt: number
  userId?: string
  eventCount?: number
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/sessions')
      const data = await res.json()
      setSessions(data.sessions || [])
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Sessions</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>ID</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>App Version</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Started</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>User</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id}>
              <td style={{ padding: '0.5rem' }}>{session.id.slice(0, 8)}...</td>
              <td style={{ padding: '0.5rem' }}>{session.appVersion}</td>
              <td style={{ padding: '0.5rem' }}>{new Date(session.startedAt).toLocaleString()}</td>
              <td style={{ padding: '0.5rem' }}>{session.userId || 'Anonymous'}</td>
              <td style={{ padding: '0.5rem' }}>
                <Link href={`/sessions/${session.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}