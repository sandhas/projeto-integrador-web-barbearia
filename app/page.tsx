import { getDashboardStats } from '@/lib/actions'
import { seed } from '@/lib/seed'
import MonthlyBarChart from '@/components/charts/MonthlyBarChart'
import CategoryPieChart from '@/components/charts/CategoryPieChart'
import { TrendingUp, TrendingDown, Wallet, Hash, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default async function DashboardPage() {
  // Seed default categories if needed
  await seed()

  const stats = await getDashboardStats()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Visão geral do mês de{' '}
          {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Receitas do Mês"
          value={formatCurrency(stats.totalRevenue)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="emerald"
          trend={stats.totalRevenue > 0 ? 'up' : 'neutral'}
        />
        <StatCard
          title="Despesas do Mês"
          value={formatCurrency(stats.totalExpenses)}
          icon={<TrendingDown className="w-5 h-5" />}
          color="rose"
          trend={stats.totalExpenses > 0 ? 'down' : 'neutral'}
        />
        <StatCard
          title="Saldo Atual"
          value={formatCurrency(stats.balance)}
          icon={<Wallet className="w-5 h-5" />}
          color={stats.balance >= 0 ? 'indigo' : 'rose'}
          trend={stats.balance >= 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Transações"
          value={String(stats.transactionCount)}
          icon={<Hash className="w-5 h-5" />}
          color="violet"
          trend="neutral"
          suffix="no mês"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly bar chart */}
        <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-1">
            Receitas × Despesas
          </h2>
          <p className="text-zinc-500 text-xs mb-5">Últimos 6 meses</p>
          <MonthlyBarChart data={stats.monthlyData} />
        </div>

        {/* Category pie chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-1">
            Despesas por Categoria
          </h2>
          <p className="text-zinc-500 text-xs mb-5">Mês atual</p>
          <CategoryPieChart data={stats.transactionsByCategory} />
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Últimas Transações</h2>
            <p className="text-zinc-500 text-xs mt-0.5">5 transações mais recentes</p>
          </div>
          <a
            href="/transacoes"
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
          >
            Ver todas →
          </a>
        </div>

        {stats.recentTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
            <p className="text-sm">Nenhuma transação registrada</p>
            <a
              href="/transacoes"
              className="mt-3 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
            >
              Adicionar primeira transação →
            </a>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {stats.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-6 py-3.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    tx.type === 'REVENUE'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {tx.type === 'REVENUE' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{tx.description}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    {tx.category} · {formatDate(tx.date)}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold shrink-0 ${
                    tx.type === 'REVENUE' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {tx.type === 'REVENUE' ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
  suffix,
}: {
  title: string
  value: string
  icon: React.ReactNode
  color: 'emerald' | 'rose' | 'indigo' | 'violet'
  trend?: 'up' | 'down' | 'neutral'
  suffix?: string
}) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
    },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
    indigo: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400',
      border: 'border-indigo-500/20',
    },
    violet: {
      bg: 'bg-violet-500/10',
      text: 'text-violet-400',
      border: 'border-violet-500/20',
    },
  }

  const c = colorMap[color]

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <p className="text-zinc-400 text-sm font-medium">{title}</p>
        <div className={`p-2 rounded-lg ${c.bg} ${c.text}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {suffix && <p className="text-zinc-500 text-xs mt-1">{suffix}</p>}
    </div>
  )
}
