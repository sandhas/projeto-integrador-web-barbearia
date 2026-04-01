import { getTransactions, getCategories } from '@/lib/actions'
import TransactionsClient from '@/components/TransactionsClient'

export default async function TransacoesPage() {
  const [transactions, categories] = await Promise.all([
    getTransactions(),
    getCategories(),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Transações</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Gerencie todas as suas receitas e despesas
        </p>
      </div>

      <TransactionsClient
        initialTransactions={transactions}
        categories={categories}
      />
    </div>
  )
}
