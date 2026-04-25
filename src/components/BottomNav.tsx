'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    href: '/dashboard',
    label: 'Início',
    color: '#00d68f',
    bg: 'linear-gradient(135deg,#00d68f,#00a870)',
    shadow: '0 4px 14px rgba(0,214,143,0.55)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/lancamentos',
    label: 'Lançamentos',
    color: '#38bdf8',
    bg: 'linear-gradient(135deg,#38bdf8,#0284c7)',
    shadow: '0 4px 14px rgba(56,189,248,0.55)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: '/novo',
    label: '',
    isAction: true,
    color: '#fff',
    bg: 'linear-gradient(135deg,#00d68f,#00a870)',
    shadow: '0 0 24px rgba(0,214,143,0.6), 0 4px 16px rgba(0,0,0,0.4)',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: '/relatorios',
    label: 'Relatórios',
    color: '#fbbf24',
    bg: 'linear-gradient(135deg,#fbbf24,#d97706)',
    shadow: '0 4px 14px rgba(251,191,36,0.55)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: '/cadastros',
    label: 'Cadastros',
    color: '#00c9b1',
    bg: 'linear-gradient(135deg,#00c9b1,#009a88)',
    shadow: '0 4px 14px rgba(0,201,177,0.55)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: 'rgba(6,9,15,0.94)',
        borderTop: '1px solid rgba(0,214,143,0.22)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 -4px 30px rgba(0,0,0,0.6)',
      }}
    >
      <div className="flex items-center justify-around px-3 h-20 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard' || pathname.startsWith('/dashboard/')
              : pathname.startsWith(item.href)

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center w-16 h-16 rounded-full -mt-6 transition-transform active:scale-95"
                style={{
                  background: item.bg,
                  color: '#fff',
                  boxShadow: item.shadow,
                  border: '2px solid rgba(0,214,143,0.5)',
                }}
                aria-label="Novo lançamento"
              >
                {item.icon}
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1.5 transition-all"
            >
              {/* Circular icon */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: isActive ? item.bg : 'rgba(255,255,255,0.05)',
                  boxShadow: isActive ? item.shadow : 'none',
                  color: isActive ? '#fff' : item.color,
                  border: isActive ? '1.5px solid rgba(255,255,255,0.2)' : '1.5px solid rgba(255,255,255,0.06)',
                }}
              >
                {item.icon}
              </div>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                  color: isActive ? item.color : 'rgba(255,255,255,0.3)',
                  textShadow: isActive ? `0 0 8px ${item.color}` : 'none',
                }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
