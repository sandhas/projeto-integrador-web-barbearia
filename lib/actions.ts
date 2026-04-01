'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from './prisma'

export type TransactionFilters = {
  type?: string
  category?: string
  dateFrom?: string
  dateTo?: string
}

export type TransactionInput = {
  description: string
  amount: number
  type: string
  category: string
  date: string
}

export type CategoryInput = {
  name: string
  type: string
  color: string
}

export async function getTransactions(filters?: TransactionFilters) {
  const where: {
    type?: string
    category?: string
    date?: { gte?: Date; lte?: Date }
  } = {}

  if (filters?.type) where.type = filters.type
  if (filters?.category) where.category = filters.category
  if (filters?.dateFrom || filters?.dateTo) {
    where.date = {}
    if (filters.dateFrom) where.date.gte = new Date(filters.dateFrom)
    if (filters.dateTo) where.date.lte = new Date(filters.dateTo + 'T23:59:59')
  }

  return prisma.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
  })
}

export async function createTransaction(data: TransactionInput) {
  const transaction = await prisma.transaction.create({
    data: {
      description: data.description,
      amount: data.amount,
      type: data.type,
      category: data.category,
      date: new Date(data.date),
    },
  })
  revalidatePath('/')
  revalidatePath('/transacoes')
  revalidatePath('/relatorios')
  return transaction
}

export async function updateTransaction(id: number, data: Partial<TransactionInput>) {
  const updateData: {
    description?: string
    amount?: number
    type?: string
    category?: string
    date?: Date
  } = {}

  if (data.description !== undefined) updateData.description = data.description
  if (data.amount !== undefined) updateData.amount = data.amount
  if (data.type !== undefined) updateData.type = data.type
  if (data.category !== undefined) updateData.category = data.category
  if (data.date !== undefined) updateData.date = new Date(data.date)

  const transaction = await prisma.transaction.update({
    where: { id },
    data: updateData,
  })
  revalidatePath('/')
  revalidatePath('/transacoes')
  revalidatePath('/relatorios')
  return transaction
}

export async function deleteTransaction(id: number) {
  await prisma.transaction.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/transacoes')
  revalidatePath('/relatorios')
}

export async function getCategories(type?: string) {
  return prisma.category.findMany({
    where: type ? { type } : undefined,
    orderBy: { name: 'asc' },
  })
}

export async function createCategory(data: CategoryInput) {
  const category = await prisma.category.create({ data })
  revalidatePath('/categorias')
  revalidatePath('/transacoes')
  return category
}

export async function deleteCategory(id: number) {
  await prisma.category.delete({ where: { id } })
  revalidatePath('/categorias')
}

export async function getDashboardStats(month?: number, year?: number) {
  const now = new Date()
  const targetMonth = month ?? now.getMonth()
  const targetYear = year ?? now.getFullYear()

  const startOfMonth = new Date(targetYear, targetMonth, 1)
  const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999)

  const [monthlyTransactions, allTransactions, recentTransactions] = await Promise.all([
    prisma.transaction.findMany({
      where: { date: { gte: startOfMonth, lte: endOfMonth } },
    }),
    prisma.transaction.findMany(),
    prisma.transaction.findMany({
      orderBy: { date: 'desc' },
      take: 5,
    }),
  ])

  const totalRevenue = monthlyTransactions
    .filter((t) => t.type === 'REVENUE')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = monthlyTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  const allRevenue = allTransactions
    .filter((t) => t.type === 'REVENUE')
    .reduce((s, t) => s + t.amount, 0)
  const allExpenses = allTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0)
  const balance = allRevenue - allExpenses

  // Last 6 months data
  const sixMonthsAgo = new Date(targetYear, targetMonth - 5, 1)
  const recentAll = allTransactions.filter((t) => new Date(t.date) >= sixMonthsAgo)

  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(targetYear, targetMonth - i, 1)
    const mStart = new Date(d.getFullYear(), d.getMonth(), 1)
    const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
    const txns = recentAll.filter((t) => {
      const td = new Date(t.date)
      return td >= mStart && td <= mEnd
    })
    monthlyData.push({
      month: d
        .toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
        .replace('.', ''),
      receitas: txns
        .filter((t) => t.type === 'REVENUE')
        .reduce((s, t) => s + t.amount, 0),
      despesas: txns
        .filter((t) => t.type === 'EXPENSE')
        .reduce((s, t) => s + t.amount, 0),
    })
  }

  // Category breakdown for current month expenses
  const expensesByCategory = monthlyTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>
    )

  const transactionsByCategory = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  return {
    totalRevenue,
    totalExpenses,
    balance,
    transactionsByCategory,
    monthlyData,
    transactionCount: monthlyTransactions.length,
    recentTransactions,
  }
}
