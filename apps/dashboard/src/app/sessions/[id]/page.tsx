'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Session {
  id: string
  appVersion: string
  startedAt: number
  device: {
    viewportWidth: number
    viewportHeight: number
    userAgent: string
  }
}

interface IssueCard {
  hypothesis: {
    id: string
    title: string
    description: string
    category: string
    confidence: number
    verifierStatus: string
  }
  evidenceSummary: string
  affectedElement: {
    selector: string
    tagName: string
  }
  blockingReasons: string[]
}

export default function SessionDetailPage() {
  const params = useParams()
  const sessionId = params.id as string
  
  const [session, setSession] = useState<Session | null>(null)
  const [issues, setIssues] = useState<IssueCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      fetchSession()
      fetchIssues()
    }
  }, [sessionId])

  const fetchSession = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/v1/sessions/${sessionId}`)
      const data = await res.json()
      setSession(data)
    } catch (error) {
      console.error('Failed to fetch session:', error)
    }
  }

  const fetchIssues = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/v1/sessions/${sessionId}/issue-cards`)
      const data = await res.json()
      setIssues(data.issues || [])
    } catch (error) {
      console.error('Failed to fetch issues:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!session) return <div>Session not found</div>

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Session {session.id.slice(0, 8)}</h1>
      
      <section style={{ marginBottom: '2rem' }}>
        <h2>Details</h2>
        <p><strong>App Version:</strong> {session.appVersion}</p>
        <p><strong>Started:</strong> {new Date(session.startedAt).toLocaleString()}</p>
        <p><strong>Device:</strong> {session.device.viewportWidth}x{session.device.viewportHeight}</p>
      </section>

      <section>
        <h2>Detected Issues ({issues.length})</h2>
        {issues.map((issue) => (
          <div 
            key={issue.hypothesis.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            <h3>{issue.hypothesis.title}</h3>
            <p><strong>Category:</strong> {issue.hypothesis.category}</p>
            <p><strong>Confidence:</strong> {(issue.hypothesis.confidence * 100).toFixed(0)}%</p>
            <p><strong>Status:</strong> {issue.hypothesis.verifierStatus}</p>
            <p>{issue.hypothesis.description}</p>
            <p><strong>Affected Element:</strong> {issue.affectedElement.selector}</p>
            <div>
              <strong>Blocking Reasons:</strong>
              <ul>
                {issue.blockingReasons.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}