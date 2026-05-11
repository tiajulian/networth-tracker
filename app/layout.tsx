import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Net Worth Tracker',
  description: 'Track your savings and financial goals',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 flex items-center h-14 gap-6">
            <Link href="/" className="font-bold text-indigo-600 text-lg tracking-tight">
              NetWorth
            </Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link href="/entry" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Enter Balances
            </Link>
            <Link href="/goals" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Goals
            </Link>
          </div>
        </nav>
        <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  )
}
