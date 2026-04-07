import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'W-UX Dashboard',
  description: 'UX Observability Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}