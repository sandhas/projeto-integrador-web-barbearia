'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createTransaction, updateTransaction } from '@/lib/actions'

type Category = {
  id: number
  name: string
  type: string
  color: string
}

type Transaction = {
  id: number
  description: string
  amount: number
  type: string
  category: string
  date: Date | string
}

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  transaction?: Transaction | null
  categories: Category[]
}

const defaultForm = {
  description: '',
  amount: '',
  type: 'REVENUE',
  category: '',
  date: new Date().toISOString().split('T')[0],
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  transaction,
  categories,
}: TransactionModalProps) {
  const [form, setForm] = useState(defaultForm)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const filteredCategories = categories.filter((c) => c.type === form.type)

  useEffect(() => {
    if (transaction) {
      const d = new Date(transaction.date)
      setForm({
        description: transaction.description,
        amount: String(transaction.amount),
        type: transaction.type,
        category: transaction.category,
        date: d.toISOString().split('T')[0],
      })
    } else {
      setForm(defaultForm)
    }
    setError('')
  }, [transaction, isOpen])

  // Reset category when type changes if current category doesn't match
  useEffect(() => {
    const match = categories.find((c) => c.name === form.category && c.type === form.type)
    if (!match) {
      setForm((prev) => ({ ...prev, category: '' }))
    }
  }, [form.type, categories]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.description.trim()) return setError('Descrição é obrigatória.')
    if (!form.amount || Number(form.amount) <= 0) return setError('Valor deve ser maior que zero.')
    if (!form.category) return setError('Selecione uma categoria.')
    if (!form.date) return setError('Data é obrigatória.')

    setIsLoading(true)
    try {
      const data = {
        description: form.description.trim(),
        amount: Number(form.amount),
        type: form.type,
        category: form.category,
        date: form.date,
      }

      if (transaction) {
        await updateTransaction(transaction.id, data)
      } else {
        await createTransaction(data)
      }
      onSuccess()
      onClose()
    } catch (err) {
      setError('Ocorreu um erro. Tente novamente.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type toggle */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              {(['REVENUE', 'EXPENSE'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, type: t }))}
                  className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                    form.type === t
                      ? t === 'REVENUE'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                        : 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                  }`}
                >
                  {t === 'REVENUE' ? '↑ Receita' : '↓ Despesa'}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Descrição
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Corte de cabelo - João"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Valor (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                R$
              </span>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="0,00"
                min="0.01"
                step="0.01"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-3.5 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Categoria
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none"
            >
              <option value="">Selecione uma categoria</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Data</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition [color-scheme:dark]"
            />
          </div>

          {error && (
            <p className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg px-3.5 py-2.5">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Salvando...
                </>
              ) : transaction ? (
                'Salvar Alterações'
              ) : (
                'Criar Transação'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
