'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, BarChart3, Tag, Scissors, Calculator, LogOut, User } from 'lucide-react'
import { logoutAction } from '@/lib/auth-actions'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transacoes', label: 'Transações', icon: ArrowLeftRight },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/categorias', label: 'Categorias', icon: Tag },
  { href: '/calculo-lucro', label: 'Calculadora', icon: Calculator },
]

export default function Sidebar({ userName }: { userName?: string }) {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-800">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600">
          <Scissors className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="block text-white font-bold text-lg leading-tight">
            BarberControl
          </span>
          <span className="block text-zinc-500 text-xs">Gestão Financeira</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-zinc-800 space-y-3">
        {userName && (
          <div className="flex items-center gap-2 px-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-700 shrink-0">
              <User className="w-4 h-4 text-zinc-300" />
            </div>
            <span className="text-zinc-400 text-xs truncate">{userName}</span>
          </div>
        )}
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sair
          </button>
        </form>
        <p className="text-xs text-zinc-600 px-2">© {new Date().getFullYear()} BarberControl</p>
      </div>
    </aside>
  )
}
