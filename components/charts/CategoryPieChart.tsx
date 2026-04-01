'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

type CategoryDataPoint = {
  name: string
  value: number
}

const COLORS = [
  '#6366f1',
  '#ec4899',
  '#f97316',
  '#eab308',
  '#10b981',
  '#06b6d4',
  '#8b5cf6',
  '#ef4444',
  '#14b8a6',
  '#84cc16',
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 shadow-xl">
        <p className="text-zinc-300 text-sm font-medium">{payload[0].name}</p>
        <p className="text-white text-sm font-semibold">{formatCurrency(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function CategoryPieChart({ data }: { data: CategoryDataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-zinc-500 text-sm">
        Nenhuma despesa no período
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-zinc-400 text-xs">{value}</span>
          )}
          wrapperStyle={{ paddingTop: '8px' }}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
