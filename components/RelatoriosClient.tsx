'use client'

import { useState, useEffect } from 'react'
import { getDashboardStats } from '@/lib/actions'
import MonthlyBarChart from '@/components/charts/MonthlyBarChart'
import CategoryPieChart from '@/components/charts/CategoryPieChart'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

type Stats = Awaited<ReturnType<typeof getDashboardStats>>

export default function RelatoriosClient() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

  useEffect(() => {
    setIsLoading(true)
    getDashboardStats(month, year)
      .then(setStats)
      .finally(() => setIsLoading(false))
  }, [month, year])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Relatórios</h1>
          <p className="text-zinc-400 text-sm mt-1">Análise detalhada das suas finanças</p>
        </div>

        {/* Period selector */}
        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={idx} value={idx}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-zinc-500">
          <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Carregando dados...
        </div>
      ) : stats ? (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-emerald-500/10">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-zinc-400 text-sm">
                  Receitas — {MONTH_NAMES[month]}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-rose-500/10">
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                </div>
                <span className="text-zinc-400 text-sm">
                  Despesas — {MONTH_NAMES[month]}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(stats.totalExpenses)}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-indigo-500/10">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-zinc-400 text-sm">Resultado</span>
              </div>
              <p
                className={`text-2xl font-bold ${
                  stats.totalRevenue - stats.totalExpenses >= 0
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {formatCurrency(stats.totalRevenue - stats.totalExpenses)}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-base font-semibold text-white mb-1">
                Evolução Mensal
              </h2>
              <p className="text-zinc-500 text-xs mb-5">6 meses até {MONTH_NAMES[month]} {year}</p>
              <MonthlyBarChart data={stats.monthlyData} />
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-base font-semibold text-white mb-1">
                Despesas por Categoria
              </h2>
              <p className="text-zinc-500 text-xs mb-5">
                {MONTH_NAMES[month]} {year}
              </p>
              <CategoryPieChart data={stats.transactionsByCategory} />
            </div>
          </div>

          {/* Monthly summary table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-base font-semibold text-white">Resumo por Mês</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-6 py-3 text-zinc-400 text-xs font-medium uppercase tracking-wider">
                      Mês
                    </th>
                    <th className="text-right px-6 py-3 text-zinc-400 text-xs font-medium uppercase tracking-wider">
                      Receitas
                    </th>
                    <th className="text-right px-6 py-3 text-zinc-400 text-xs font-medium uppercase tracking-wider">
                      Despesas
                    </th>
                    <th className="text-right px-6 py-3 text-zinc-400 text-xs font-medium uppercase tracking-wider">
                      Resultado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {stats.monthlyData.map((row, idx) => {
                    const resultado = row.receitas - row.despesas
                    return (
                      <tr key={idx} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-3.5 text-white text-sm font-medium capitalize">
                          {row.month}
                        </td>
                        <td className="px-6 py-3.5 text-right text-emerald-400 text-sm font-medium">
                          {formatCurrency(row.receitas)}
                        </td>
                        <td className="px-6 py-3.5 text-right text-rose-400 text-sm font-medium">
                          {formatCurrency(row.despesas)}
                        </td>
                        <td
                          className={`px-6 py-3.5 text-right text-sm font-semibold ${
                            resultado >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {formatCurrency(resultado)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category breakdown table */}
          {stats.transactionsByCategory.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800">
                <h2 className="text-base font-semibold text-white">
                  Despesas por Categoria — {MONTH_NAMES[month]} {year}
                </h2>
              </div>
              <div className="divide-y divide-zinc-800">
                {stats.transactionsByCategory.map((cat, idx) => {
                  const pct = stats.totalExpenses > 0
                    ? (cat.value / stats.totalExpenses) * 100
                    : 0
                  return (
                    <div key={idx} className="px-6 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm font-medium">{cat.name}</span>
                        <div className="text-right">
                          <span className="text-rose-400 text-sm font-semibold">
                            {formatCurrency(cat.value)}
                          </span>
                          <span className="text-zinc-500 text-xs ml-2">
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5">
                        <div
                          className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
