import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Nav } from '@/components/Nav'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Net Worth Tracker',
  description: 'Track your savings and financial goals',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <Nav />
        <main style={{ maxWidth: '896px', margin: '0 auto', padding: '32px 16px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
