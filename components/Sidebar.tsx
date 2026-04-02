'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, BarChart3, Tag, Scissors, Calculator } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transacoes', label: 'Transações', icon: ArrowLeftRight },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/categorias', label: 'Categorias', icon: Tag },
  { href: '/calculo-lucro', label: 'Calculadora', icon: Calculator },
]

export default function Sidebar() {
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
      <div className="px-6 py-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-600">© {new Date().getFullYear()} BarberControl</p>
      </div>
    </aside>
  )
}
