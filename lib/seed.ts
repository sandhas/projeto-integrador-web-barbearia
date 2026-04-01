import { prisma } from './prisma'

const EXPENSE_CATEGORIES = [
  { name: 'Aluguel', type: 'EXPENSE', color: '#ef4444' },
  { name: 'Produtos', type: 'EXPENSE', color: '#f97316' },
  { name: 'Água e Luz', type: 'EXPENSE', color: '#eab308' },
  { name: 'Equipamentos', type: 'EXPENSE', color: '#8b5cf6' },
  { name: 'Marketing', type: 'EXPENSE', color: '#ec4899' },
  { name: 'Salários', type: 'EXPENSE', color: '#14b8a6' },
  { name: 'Manutenção', type: 'EXPENSE', color: '#6366f1' },
  { name: 'Outros Gastos', type: 'EXPENSE', color: '#6b7280' },
]

const REVENUE_CATEGORIES = [
  { name: 'Corte', type: 'REVENUE', color: '#22c55e' },
  { name: 'Barba', type: 'REVENUE', color: '#10b981' },
  { name: 'Combo', type: 'REVENUE', color: '#06b6d4' },
  { name: 'Coloração', type: 'REVENUE', color: '#3b82f6' },
  { name: 'Tratamento', type: 'REVENUE', color: '#a855f7' },
  { name: 'Outros Serviços', type: 'REVENUE', color: '#84cc16' },
]

export async function seed() {
  const count = await prisma.category.count()
  if (count > 0) return

  const all = [...EXPENSE_CATEGORIES, ...REVENUE_CATEGORIES]
  for (const cat of all) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    })
  }
}
