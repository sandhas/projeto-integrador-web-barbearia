'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import TransactionModal from './TransactionModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import { getTransactions, deleteTransaction, TransactionFilters } from '@/lib/actions'

type Transaction = {
  id: number
  description: string
  amount: number
  type: string
  category: string
  date: Date | string
  createdAt: Date | string
  updatedAt: Date | string
}

type Category = {
  id: number
  name: string
  type: string
  color: string
}

interface Props {
  initialTransactions: Transaction[]
  categories: Category[]
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default function TransactionsClient({ initialTransactions, categories }: Props) {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [filters, setFilters] = useState<TransactionFilters>({})
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isLoadingDelete, setIsLoadingDelete] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)

  const applyFilters = useCallback(async (newFilters: TransactionFilters) => {
    setIsFiltering(true)
    try {
      const result = await getTransactions(newFilters)
      setTransactions(result as Transaction[])
    } finally {
      setIsFiltering(false)
    }
  }, [])

  const handleFilterChange = (key: keyof TransactionFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined }
    setFilters(newFilters)
    applyFilters(newFilters)
  }

  const handleSuccess = async () => {
    const result = await getTransactions(filters)
    setTransactions(result as Transaction[])
    router.refresh()
  }

  const handleEdit = (tx: Transaction) => {
    setSelectedTransaction(tx)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (id: number) => {
    setDeletingId(id)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (deletingId === null) return
    setIsLoadingDelete(true)
    try {
      await deleteTransaction(deletingId)
      const result = await getTransactions(filters)
      setTransactions(result as Transaction[])
      router.refresh()
    } finally {
      setIsLoadingDelete(false)
      setIsDeleteModalOpen(false)
      setDeletingId(null)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedTransaction(null)
  }

  const filteredBySearch = search.trim()
    ? transactions.filter(
        (t) =>
          t.description.toLowerCase().includes(search.toLowerCase()) ||
          t.category.toLowerCase().includes(search.toLowerCase())
      )
    : transactions

  const totalRevenue = filteredBySearch
    .filter((t) => t.type === 'REVENUE')
    .reduce((s, t) => s + t.amount, 0)
  const totalExpenses = filteredBySearch
    .filter((t) => t.type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0)

  return (
    <>
      {/* Summary pills */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 text-sm font-medium">
            Receitas: {formatCurrency(totalRevenue)}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5">
          <TrendingDown className="w-4 h-4 text-rose-400" />
          <span className="text-rose-400 text-sm font-medium">
            Despesas: {formatCurrency(totalExpenses)}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-2.5">
          <span
            className={`text-sm font-medium ${
              totalRevenue - totalExpenses >= 0 ? 'text-indigo-400' : 'text-rose-400'
            }`}
          >
            Saldo: {formatCurrency(totalRevenue - totalExpenses)}
          </span>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar transações..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-3.5 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Type filter */}
          <select
            value={filters.type ?? ''}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none min-w-[140px]"
          >
            <option value="">Todos os tipos</option>
            <option value="REVENUE">Receitas</option>
            <option value="EXPENSE">Despesas</option>
          </select>

          {/* Category filter */}
          <select
            value={filters.category ?? ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none min-w-[160px]"
          >
            <option value="">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Date range */}
          <input
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 [color-scheme:dark]"
          />
          <input
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 [color-scheme:dark]"
          />

          {/* Add button */}
          <button
            onClick={() => {
              setSelectedTransaction(null)
              setIsModalOpen(true)
            }}
            className="ml-auto flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Transação
          </button>
        </div>
      </div>

      {/* Transactions list */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {isFiltering ? (
          <div className="flex items-center justify-center py-16 text-zinc-500">
            <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Carregando...
          </div>
        ) : filteredBySearch.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <Filter className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Nenhuma transação encontrada</p>
            <p className="text-xs mt-1 text-zinc-600">Tente ajustar os filtros</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {filteredBySearch.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-800/50 transition-colors group"
              >
                {/* Type indicator */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    tx.type === 'REVENUE'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {tx.type === 'REVENUE' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{tx.description}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    {tx.category} · {formatDate(tx.date)}
                  </p>
                </div>

                {/* Amount */}
                <span
                  className={`text-sm font-semibold shrink-0 ${
                    tx.type === 'REVENUE' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {tx.type === 'REVENUE' ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => handleEdit(tx)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(tx.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-600 mt-3 text-right">
        {filteredBySearch.length} transaç{filteredBySearch.length === 1 ? 'ão' : 'ões'} encontrada
        {filteredBySearch.length === 1 ? '' : 's'}
      </p>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        transaction={selectedTransaction}
        categories={categories}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeletingId(null)
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={isLoadingDelete}
        title="Excluir transação"
        message="Esta ação não pode ser desfeita. A transação será removida permanentemente."
      />
    </>
  )
}
