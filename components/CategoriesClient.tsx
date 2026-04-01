'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, Tag } from 'lucide-react'
import { createCategory, deleteCategory } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import DeleteConfirmModal from './DeleteConfirmModal'

type Category = {
  id: number
  name: string
  type: string
  color: string
}

interface Props {
  categories: Category[]
}

const DEFAULT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#10b981', '#06b6d4', '#3b82f6',
  '#14b8a6', '#6b7280',
]

const defaultForm = { name: '', type: 'REVENUE', color: '#6366f1' }

export default function CategoriesClient({ categories }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState(defaultForm)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeletingLoading, setIsDeletingLoading] = useState(false)

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE')
  const revenueCategories = categories.filter((c) => c.type === 'REVENUE')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('Nome é obrigatório.')

    startTransition(async () => {
      try {
        await createCategory({
          name: form.name.trim(),
          type: form.type,
          color: form.color,
        })
        setForm(defaultForm)
        router.refresh()
      } catch {
        setError('Erro ao criar categoria. O nome pode já existir.')
      }
    })
  }

  const handleDeleteClick = (id: number) => {
    setDeletingId(id)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (deletingId === null) return
    setIsDeletingLoading(true)
    try {
      await deleteCategory(deletingId)
      router.refresh()
    } finally {
      setIsDeletingLoading(false)
      setIsDeleteModalOpen(false)
      setDeletingId(null)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Add form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-5">Nova Categoria</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Type */}
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
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    {t === 'REVENUE' ? 'Receita' : 'Despesa'}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Nome</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Aluguel, Corte..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Cor</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {DEFAULT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, color: c }))}
                    className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                      form.color === c ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-white scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                  className="w-10 h-9 rounded cursor-pointer bg-transparent border-0 p-0"
                />
                <span className="text-zinc-500 text-xs font-mono">{form.color}</span>
              </div>
            </div>

            {error && (
              <p className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg px-3.5 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {isPending ? 'Criando...' : 'Criar Categoria'}
            </button>
          </form>
        </div>

        {/* Categories list */}
        <div className="xl:col-span-2 space-y-6">
          {/* Revenue categories */}
          <CategorySection
            title="Categorias de Receita"
            categories={revenueCategories}
            onDelete={handleDeleteClick}
          />

          {/* Expense categories */}
          <CategorySection
            title="Categorias de Despesa"
            categories={expenseCategories}
            onDelete={handleDeleteClick}
          />
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeletingId(null)
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeletingLoading}
        title="Excluir categoria"
        message="Esta categoria será removida permanentemente. Transações existentes com esta categoria não serão afetadas."
      />
    </>
  )
}

function CategorySection({
  title,
  categories,
  onDelete,
}: {
  title: string
  categories: Category[]
  onDelete: (id: number) => void
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <span className="text-xs text-zinc-500 bg-zinc-800 px-2.5 py-1 rounded-full">
          {categories.length} categorias
        </span>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-zinc-500">
          <Tag className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-sm">Nenhuma categoria cadastrada</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 px-5 py-3.5 group hover:bg-zinc-800/50 transition-colors"
            >
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0 ring-1 ring-white/10"
                style={{ backgroundColor: cat.color }}
              />
              <span className="flex-1 text-white text-sm font-medium">{cat.name}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  cat.type === 'REVENUE'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-rose-500/10 text-rose-400'
                }`}
              >
                {cat.type === 'REVENUE' ? 'Receita' : 'Despesa'}
              </span>
              <button
                onClick={() => onDelete(cat.id)}
                className="p-1.5 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                title="Excluir categoria"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
