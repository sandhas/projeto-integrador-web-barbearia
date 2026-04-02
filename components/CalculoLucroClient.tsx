'use client'

import { useState, useEffect, useRef } from 'react'
import { Calculator, Info, TrendingUp, TrendingDown } from 'lucide-react'

// ─── helpers ────────────────────────────────────────────────────────────────

function maskCurrency(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  const num = parseInt(digits, 10)
  return (num / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function parseCurrency(value: string): number {
  if (!value) return 0
  const cleaned = value.replace(/\./g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}

function formatBRL(num: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
}

function parsePercent(value: string): number {
  return parseFloat(value.replace(',', '.')) || 0
}

function parseQty(value: string): number {
  return parseInt(value, 10) || 0
}

// ─── types ───────────────────────────────────────────────────────────────────

type FormState = {
  precoVenda: string
  custoProduto: string
  imposto: string
  taxaCartao: string
  taxaFixa: string
  custoFixoMensal: string
  vendasMes: string
  proLabore: string
}

type Result = {
  lucroLiquido: number
  margemLucro: number
  valorImposto: number
  valorTaxaCartao: number
  custoFixoPorVenda: number
  proLaborePorVenda: number
  totalDescontos: number
}

const INITIAL_FORM: FormState = {
  precoVenda: '',
  custoProduto: '',
  imposto: '0',
  taxaCartao: '',
  taxaFixa: '',
  custoFixoMensal: '',
  vendasMes: '',
  proLabore: '',
}

// ─── component ───────────────────────────────────────────────────────────────

export default function CalculoLucroClient() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [result, setResult] = useState<Result | null>(null)
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Real-time calculation with 300ms debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      const precoVenda = parseCurrency(form.precoVenda)
      const custoProduto = parseCurrency(form.custoProduto)
      const imposto = parsePercent(form.imposto)
      const taxaCartao = parsePercent(form.taxaCartao)
      const taxaFixa = parseCurrency(form.taxaFixa)
      const custoFixoMensal = parseCurrency(form.custoFixoMensal)
      const vendasMes = parseQty(form.vendasMes)
      const proLabore = parseCurrency(form.proLabore)

      if (precoVenda <= 0) {
        setResult(null)
        return
      }

      const valorImposto = precoVenda * (imposto / 100)
      const valorTaxaCartao = precoVenda * (taxaCartao / 100)
      const custoFixoPorVenda = vendasMes > 0 ? custoFixoMensal / vendasMes : 0
      const proLaborePorVenda = vendasMes > 0 ? proLabore / vendasMes : 0

      const totalDescontos =
        custoProduto +
        valorImposto +
        valorTaxaCartao +
        taxaFixa +
        custoFixoPorVenda +
        proLaborePorVenda

      const lucroLiquido = precoVenda - totalDescontos
      const margemLucro = precoVenda > 0 ? (lucroLiquido / precoVenda) * 100 : 0

      setResult({
        lucroLiquido,
        margemLucro,
        valorImposto,
        valorTaxaCartao,
        custoFixoPorVenda,
        proLaborePorVenda,
        totalDescontos,
      })
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [form])

  function handleCurrencyChange(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: maskCurrency(e.target.value) }))
    }
  }

  function handleTextChange(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      // For quantity field, reject negative values
      if (field === 'vendasMes') {
        const num = parseInt(raw, 10)
        if (raw !== '' && (isNaN(num) || num < 0)) return
      }
      setForm((prev) => ({ ...prev, [field]: raw }))
    }
  }

  const inputClass =
    'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-zinc-600'

  const labelClass = 'block text-sm font-medium text-zinc-300 mb-1.5'

  const prefixedInput = (
    prefix: string,
    field: keyof FormState,
    placeholder: string,
    handler: ReturnType<typeof handleCurrencyChange>
  ) => (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm select-none">
        {prefix}
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={form[field]}
        onChange={handler}
        placeholder={placeholder}
        className={`${inputClass} pl-8`}
      />
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Calculadora de Lucro</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Calcule o lucro líquido por venda de produto ou serviço em tempo real
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Form ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-500/10">
              <Calculator className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="text-base font-semibold text-white">Dados da Venda</h2>
          </div>

          {/* Preço de Venda */}
          <div>
            <label className={labelClass}>Preço de Venda (R$)</label>
            {prefixedInput('R$', 'precoVenda', '0,00', handleCurrencyChange('precoVenda'))}
          </div>

          {/* Custo do Produto */}
          <div>
            <label className={labelClass}>Custo do Produto / Serviço (R$)</label>
            {prefixedInput('R$', 'custoProduto', '0,00', handleCurrencyChange('custoProduto'))}
          </div>

          {/* Imposto */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <label className={`${labelClass} mb-0`}>Imposto Simplificado (%)</label>
              <div className="relative">
                <button
                  type="button"
                  onMouseEnter={() => setTooltipOpen(true)}
                  onMouseLeave={() => setTooltipOpen(false)}
                  onFocus={() => setTooltipOpen(true)}
                  onBlur={() => setTooltipOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                  aria-label="Informação sobre imposto"
                >
                  <Info className="w-4 h-4" />
                </button>
                {tooltipOpen && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-zinc-700 border border-zinc-600 rounded-lg p-3 text-xs text-zinc-200 z-20 shadow-xl">
                    Se você é{' '}
                    <span className="text-white font-semibold">Simples Nacional</span>, coloque sua
                    alíquota do DAS aqui. Se é{' '}
                    <span className="text-white font-semibold">MEI</span>, deixe 0 e jogue a guia
                    no custo fixo.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-700" />
                  </div>
                )}
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={form.imposto}
                onChange={handleTextChange('imposto')}
                placeholder="0"
                className={`${inputClass} pr-8`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm select-none">
                %
              </span>
            </div>
          </div>

          {/* Taxa Cartão */}
          <div>
            <label className={labelClass}>Taxa do Cartão / Marketplace (%)</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={form.taxaCartao}
                onChange={handleTextChange('taxaCartao')}
                placeholder="0"
                className={`${inputClass} pr-8`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm select-none">
                %
              </span>
            </div>
          </div>

          {/* Taxa Fixa */}
          <div>
            <label className={labelClass}>
              Taxa Fixa da Transação (R$){' '}
              <span className="text-zinc-500 font-normal">ex: R$ 0,40 do PIX</span>
            </label>
            {prefixedInput('R$', 'taxaFixa', '0,00', handleCurrencyChange('taxaFixa'))}
          </div>

          {/* Custo Fixo Mensal */}
          <div>
            <label className={labelClass}>
              Custo Fixo Mensal (R$){' '}
              <span className="text-zinc-500 font-normal">aluguel, MEI, contador…</span>
            </label>
            {prefixedInput(
              'R$',
              'custoFixoMensal',
              '0,00',
              handleCurrencyChange('custoFixoMensal')
            )}
          </div>

          {/* Vendas Estimadas */}
          <div>
            <label className={labelClass}>Vendas Estimadas / Mês (Qtd)</label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={form.vendasMes}
              onChange={handleTextChange('vendasMes')}
              placeholder="0"
              className={inputClass}
            />
          </div>

          {/* Pró-labore */}
          <div>
            <label className={labelClass}>Pró-labore Desejado (R$)</label>
            {prefixedInput('R$', 'proLabore', '0,00', handleCurrencyChange('proLabore'))}
          </div>
        </div>

        {/* ── Results ── */}
        <div className="flex flex-col gap-4">
          {result ? (
            <>
              {/* Main KPI */}
              <div
                className={`bg-zinc-900 border rounded-2xl p-6 ${
                  result.lucroLiquido >= 0 ? 'border-emerald-700/50' : 'border-rose-700/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`p-1.5 rounded-lg ${
                      result.lucroLiquido >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                    }`}
                  >
                    {result.lucroLiquido >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                  <span className="text-zinc-400 text-sm">Lucro Líquido por Venda</span>
                </div>
                <p
                  className={`text-4xl font-bold ${
                    result.lucroLiquido >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatBRL(result.lucroLiquido)}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    result.margemLucro >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  Margem:{' '}
                  <span className="font-semibold">{result.margemLucro.toFixed(2)}%</span>
                </p>
              </div>

              {/* Breakdown */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                  Composição do Resultado
                </h3>
                <div className="space-y-2.5 text-sm">
                  <BreakdownRow
                    label="Preço de Venda"
                    value={parseCurrency(form.precoVenda)}
                    type="neutral"
                    prefix="(+)"
                  />
                  <div className="border-t border-zinc-800 pt-2.5 space-y-2.5">
                    <BreakdownRow
                      label="Custo do Produto / Serviço"
                      value={parseCurrency(form.custoProduto)}
                      type="cost"
                      prefix="(−)"
                    />
                    {result.valorImposto > 0 && (
                      <BreakdownRow
                        label="Imposto"
                        value={result.valorImposto}
                        type="cost"
                        prefix="(−)"
                      />
                    )}
                    {result.valorTaxaCartao > 0 && (
                      <BreakdownRow
                        label="Taxa do Cartão / Marketplace"
                        value={result.valorTaxaCartao}
                        type="cost"
                        prefix="(−)"
                      />
                    )}
                    {parseCurrency(form.taxaFixa) > 0 && (
                      <BreakdownRow
                        label="Taxa Fixa da Transação"
                        value={parseCurrency(form.taxaFixa)}
                        type="cost"
                        prefix="(−)"
                      />
                    )}
                    {result.custoFixoPorVenda > 0 && (
                      <BreakdownRow
                        label="Custo Fixo Rateado por Venda"
                        value={result.custoFixoPorVenda}
                        type="cost"
                        prefix="(−)"
                      />
                    )}
                    {result.proLaborePorVenda > 0 && (
                      <BreakdownRow
                        label="Pró-labore Rateado por Venda"
                        value={result.proLaborePorVenda}
                        type="cost"
                        prefix="(−)"
                      />
                    )}
                  </div>
                  <div className="border-t-2 border-zinc-700 pt-3 mt-1">
                    <BreakdownRow
                      label="Lucro Líquido"
                      value={result.lucroLiquido}
                      type={result.lucroLiquido >= 0 ? 'profit' : 'loss'}
                      prefix="(=)"
                      bold
                    />
                  </div>
                </div>
              </div>

              {/* Margin bar */}
              {parseCurrency(form.precoVenda) > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-zinc-400">Margem de Lucro</span>
                    <span
                      className={`text-sm font-bold ${
                        result.margemLucro >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {result.margemLucro.toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        result.margemLucro >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{
                        width: `${Math.min(Math.abs(result.margemLucro), 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    {result.margemLucro < 0
                      ? 'Atenção: você está operando no prejuízo!'
                      : result.margemLucro < 10
                      ? 'Margem baixa — revise seus custos.'
                      : result.margemLucro < 20
                      ? 'Margem razoável.'
                      : 'Ótima margem! 🎉'}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 text-center h-full min-h-64">
              <div className="p-3 rounded-full bg-zinc-800">
                <Calculator className="w-7 h-7 text-zinc-600" />
              </div>
              <p className="text-zinc-500 text-sm">
                Preencha o <span className="text-zinc-300 font-medium">Preço de Venda</span> para
                ver o resultado
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── sub-component ───────────────────────────────────────────────────────────

function BreakdownRow({
  label,
  value,
  type,
  prefix,
  bold = false,
}: {
  label: string
  value: number
  type: 'neutral' | 'cost' | 'profit' | 'loss'
  prefix: string
  bold?: boolean
}) {
  const colorMap = {
    neutral: 'text-zinc-300',
    cost: 'text-rose-400',
    profit: 'text-emerald-400',
    loss: 'text-rose-400',
  }

  return (
    <div className={`flex items-center justify-between gap-2 ${bold ? 'font-semibold' : ''}`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-zinc-600 font-mono text-xs shrink-0">{prefix}</span>
        <span className={`${bold ? 'text-white' : 'text-zinc-400'} truncate`}>{label}</span>
      </div>
      <span className={`${colorMap[type]} shrink-0`}>{formatBRL(value)}</span>
    </div>
  )
}
