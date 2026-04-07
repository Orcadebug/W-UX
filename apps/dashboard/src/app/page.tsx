import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>W-UX Dashboard</h1>
      <nav>
        <ul>
          <li><Link href="/sessions">Sessions</Link></li>
        </ul>
      </nav>
    </main>
  )
}