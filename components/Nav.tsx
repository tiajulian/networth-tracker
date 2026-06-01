'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/entry', label: 'Enter Balances' },
  { href: '/goals', label: 'Goals' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(10,15,30,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid #1e2d45',
      height: '64px',
    }}>
      <div style={{
        maxWidth: '896px',
        margin: '0 auto',
        padding: '0 16px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <Link href="/" style={{
          fontWeight: 800,
          fontSize: '18px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginRight: '16px',
          textDecoration: 'none',
          flexShrink: 0,
        }}>
          💰 NetWorth
        </Link>

        {links.map(link => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: active ? 600 : 400,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                border: active ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                color: active ? '#6366f1' : '#64748b',
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
