/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Scale, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Percent, 
  HelpCircle,
  PiggyBank,
  ChevronRight,
  ArrowRightLeft
} from 'lucide-react';
import { Transaction, BudgetLimit, ExpenseCategory } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  budgets: BudgetLimit[];
  monthlyEconomyGoal: number;
}

export default function Dashboard({ transactions, budgets, monthlyEconomyGoal }: DashboardProps) {
  const [hoverCategory, setHoverCategory] = useState<string | null>(null);

  // Filter out calculations
  const totalReceitas = transactions
    .filter(t => t.type === 'receita')
    .reduce((acc, t) => acc + t.value, 0);

  const totalGastos = transactions
    .filter(t => t.type === 'gasto')
    .reduce((acc, t) => acc + t.value, 0);

  const saldoAtual = totalReceitas - totalGastos;
  
  // Expenses status calculation
  const gastosPagos = transactions
    .filter(t => t.type === 'gasto' && t.status === 'pago')
    .reduce((acc, t) => acc + t.value, 0);

  const gastosPendentes = transactions
    .filter(t => t.type === 'gasto' && t.status === 'pendente')
    .reduce((acc, t) => acc + t.value, 0);

  const gastosAtrasados = transactions
    .filter(t => t.type === 'gasto' && t.status === 'atrasado')
    .reduce((acc, t) => acc + t.value, 0);

  // Group by Category
  const gastosPorCategoria: Record<ExpenseCategory, number> = {
    'Alimentação': 0,
    'Transporte': 0,
    'Educação': 0,
    'Lazer': 0,
    'Saúde': 0,
    'Moradia': 0,
    'Outros': 0
  };

  transactions
    .filter(t => t.type === 'gasto')
    .forEach(t => {
      const cat = t.category as ExpenseCategory;
      if (gastosPorCategoria[cat] !== undefined) {
        gastosPorCategoria[cat] += t.value;
      } else {
        gastosPorCategoria['Outros'] += t.value;
      }
    });

  const totalGastosCategorizados = Object.values(gastosPorCategoria).reduce((a, b) => a + b, 0);

  // Category Colors
  const catColors: Record<ExpenseCategory, string> = {
    'Alimentação': 'bg-amber-500 text-amber-500 fill-amber-500',
    'Transporte': 'bg-blue-500 text-blue-500 fill-blue-500',
    'Educação': 'bg-violet-500 text-violet-500 fill-violet-500',
    'Lazer': 'bg-pink-500 text-pink-500 fill-pink-500',
    'Saúde': 'bg-rose-500 text-rose-500 fill-rose-500',
    'Moradia': 'bg-teal-500 text-teal-500 fill-teal-500',
    'Outros': 'bg-slate-400 text-slate-400 fill-slate-400'
  };

  const catHexColors: Record<ExpenseCategory, string> = {
    'Alimentação': '#f59e0b',
    'Transporte': '#3b82f6',
    'Educação': '#8b5cf6',
    'Lazer': '#ec4899',
    'Saúde': '#f43f5e',
    'Moradia': '#14b8a6',
    'Outros': '#94a3b8'
  };

  // Group by Bank for analytics
  const gastosPorBanco: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'gasto')
    .forEach(t => {
      gastosPorBanco[t.bank] = (gastosPorBanco[t.bank] || 0) + t.value;
    });

  // Calculate Month-over-Month Comparison
  // Find distinct months
  const months = Array.from(new Set(transactions.map(t => {
    const d = new Date(t.purchaseDate);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }))).sort();

  const moMData = months.map(m => {
    const receitas = transactions
      .filter(t => t.type === 'receita' && t.purchaseDate.startsWith(m))
      .reduce((s, t) => s + t.value, 0);
    const despesas = transactions
      .filter(t => t.type === 'gasto' && t.purchaseDate.startsWith(m))
      .reduce((s, t) => s + t.value, 0);
    
    // label formatting (e.g. "Jun/26")
    const parts = m.split('-');
    const year = parts[0].slice(-2);
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const label = `${monthNames[parseInt(parts[1]) - 1]}/${year}`;

    return { month: m, label, receitas, despesas };
  });

  // Budget progress warnings
  const warnings = budgets.map(b => {
    const spent = gastosPorCategoria[b.category] || 0;
    const pct = b.limitValue > 0 ? (spent / b.limitValue) * 100 : 0;
    return {
      category: b.category,
      spent,
      limit: b.limitValue,
      pct
    };
  }).filter(item => item.pct >= 80);

  // Calculations for custom SVG Pie chart
  // Build slices
  let accumulatedAngle = 0;
  const pieSlices = Object.entries(gastosPorCategoria)
    .filter(([_, value]) => value > 0)
    .map(([category, value]) => {
      const percentage = (value / (totalGastosCategorizados || 1)) * 100;
      const angle = (value / (totalGastosCategorizados || 1)) * 360;
      const startAngle = accumulatedAngle;
      accumulatedAngle += angle;

      // coordinates for path
      const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
        return {
          x: centerX + radius * Math.cos(angleInRadians),
          y: centerY + radius * Math.sin(angleInRadians)
        };
      };

      const centerX = 100;
      const centerY = 100;
      const radius = 65;
      const innerRadius = 40;

      const start = polarToCartesian(centerX, centerY, radius, startAngle);
      const end = polarToCartesian(centerX, centerY, radius, startAngle + angle);
      const innerStart = polarToCartesian(centerX, centerY, innerRadius, startAngle + angle);
      const innerEnd = polarToCartesian(centerX, centerY, innerRadius, startAngle);

      const largeArcFlag = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${start.x} ${start.y}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
        `L ${innerStart.x} ${innerStart.y}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerEnd.x} ${innerEnd.y}`,
        'Z'
      ].join(' ');

      return {
        category: category as ExpenseCategory,
        value,
        percentage,
        pathData,
        color: catHexColors[category as ExpenseCategory]
      };
    });

  // Safe division helpers
  const economyGoalPct = monthlyEconomyGoal > 0 ? Math.min(100, (saldoAtual / monthlyEconomyGoal) * 100) : 0;

  return (
    <div id="dashboard-tab-content" className="space-y-6">
      
      {/* 4 Card KPI Grid: Balances & Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Receitas Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-100 dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-lg hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Receitas do Mês
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-mono text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <span className="mt-1 flex items-center space-x-1 font-sans text-xs text-slate-400 dark:text-slate-500">
              <span>Total acumulado no período</span>
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 opacity-60"></div>
        </div>

        {/* Despesas Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-100 dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-lg hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Despesas do Mês
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-mono text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              R$ {totalGastos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <span className="mt-1 flex items-center text-xs">
              <span className="font-sans text-slate-400 dark:text-slate-500">
                Pago: {((gastosPagos / (totalGastos || 1)) * 100).toFixed(0)}% • Pendente: {(((gastosPendentes + gastosAtrasados) / (totalGastos || 1)) * 100).toFixed(0)}%
              </span>
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500 opacity-60"></div>
        </div>

        {/* Saldo Líquido Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-100 dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-lg hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Saldo Líquido Atual
            </span>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${saldoAtual >= 0 ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400' : 'bg-red-50 text-red-650 dark:bg-red-950/40 dark:text-red-400'}`}>
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className={`font-mono text-2xl font-bold leading-tight ${saldoAtual >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-450'}`}>
              R$ {saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <span className="mt-1 flex items-center space-x-1 font-sans text-xs">
              {saldoAtual >= 0 ? (
                <span className="text-emerald-500 font-medium">Fluxo de Caixa Positivo</span>
              ) : (
                <span className="text-rose-500 font-medium font-mono">Défice financeiro! Atenção</span>
              )}
            </span>
          </div>
          <div className={`absolute bottom-0 left-0 right-0 h-1 opacity-60 ${saldoAtual >= 0 ? 'bg-sky-500' : 'bg-rose-600'}`}></div>
        </div>

        {/* Orçamento Restante Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-100 dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-lg hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Metas de Economia
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <PiggyBank className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-mono text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {economyGoalPct.toFixed(0)}%
            </h3>
            <div className="mt-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${economyGoalPct}%` }}
              />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400 opacity-60"></div>
        </div>

      </div>

      {/* Main Row: SVG Pie Chart & MoM Comparisons */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        
        {/* Left Column: Category Donut Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-5 border border-slate-100 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4 border-b border-slate-50 dark:border-slate-800">
            <div>
              <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                Distribuição de Gastos
              </h4>
              <p className="text-[10px] text-slate-400">Categorização das despesas registradas</p>
            </div>
            <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-1 px-2.5 rounded-lg">
              Total: R$ {totalGastosCategorizados.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </span>
          </div>

          {totalGastosCategorizados > 0 ? (
            <div className="flex flex-col sm:flex-row items-center justify-around py-6 gap-4">
              {/* Donut SVG */}
              <div className="relative h-44 w-44 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                  {pieSlices.map((slice, idx) => (
                    <path
                      key={idx}
                      d={slice.pathData}
                      fill={slice.color}
                      className="cursor-pointer transition-all duration-300 hover:opacity-90 hover:stroke-white hover:stroke-1 dark:hover:stroke-slate-900"
                      onMouseEnter={() => setHoverCategory(slice.category)}
                      onMouseLeave={() => setHoverCategory(null)}
                      style={{
                        transform: hoverCategory === slice.category ? 'scale(1.03)' : 'scale(1)',
                        transformOrigin: 'center'
                      }}
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
                    {hoverCategory || "Estatística"}
                  </span>
                  <span className="font-mono text-base font-bold text-slate-700 dark:text-slate-200">
                    {hoverCategory ? (
                      `R$ ${gastosPorCategoria[hoverCategory as ExpenseCategory].toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
                    ) : (
                      `${((gastosPagos / (totalGastos || 1)) * 100).toFixed(0)}% pago`
                    )}
                  </span>
                </div>
              </div>

              {/* Categoric Legend items */}
              <div className="flex flex-col space-y-2 text-xs w-full sm:w-auto min-w-[140px]">
                {Object.entries(gastosPorCategoria).map(([cat, val]) => {
                  if (val === 0) return null;
                  const pct = ((val / totalGastosCategorizados) * 100).toFixed(0);
                  const isHovered = hoverCategory === cat;
                  return (
                    <div 
                      key={cat} 
                      className={`flex items-center justify-between p-1 rounded-md transition-colors ${isHovered ? 'bg-slate-50 dark:bg-slate-800' : 'bg-transparent'}`}
                      onMouseEnter={() => setHoverCategory(cat)}
                      onMouseLeave={() => setHoverCategory(null)}
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${catColors[cat as ExpenseCategory].split(' ')[0]}`}></span>
                        <span className="text-slate-600 dark:text-slate-300 font-medium">{cat}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 ml-4">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <p className="text-xs">Nenhuma despesa registrada para exibir análise por categoria.</p>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Cashflow/Monthly Comparison */}
        <div className="lg:col-span-3 rounded-2xl bg-white p-5 border border-slate-100 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4 border-b border-slate-50 dark:border-slate-800">
            <div>
              <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                Comparativo de Fluxo Mensal
              </h4>
              <p className="text-[10px] text-slate-400">Evolução de receitas versus despesas acumuladas</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                <span>Receita</span>
              </span>
              <span className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                <span>Despesa</span>
              </span>
            </div>
          </div>

          <div className="py-6 flex flex-col justify-end h-44 space-y-4">
            {moMData.length > 0 ? (
              <div className="flex items-end justify-around h-full pt-4">
                {moMData.map((data, index) => {
                  const maxVal = Math.max(
                    ...moMData.map(d => Math.max(d.receitas, d.despesas)),
                    1
                  );
                  const incomingPct = (data.receitas / maxVal) * 100;
                  const outgoingPct = (data.despesas / maxVal) * 100;

                  return (
                    <div key={index} className="flex flex-col items-center justify-end h-full group px-2">
                      <div className="flex items-end space-x-1 h-32 w-14">
                        {/* Income bar */}
                        <div className="relative w-5 select-none h-full flex items-end">
                          <div 
                            className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t shadow-sm transition-all duration-500 group-hover:brightness-105"
                            style={{ height: `${incomingPct}%` }}
                          />
                          {/* Tooltip on Hover */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 dark:bg-black text-white text-[9px] py-1 px-1.5 rounded font-mono shadow-md z-10 whitespace-nowrap">
                            Rec: R$ {data.receitas.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                          </div>
                        </div>

                        {/* Expense bar */}
                        <div className="relative w-5 select-none h-full flex items-end">
                          <div 
                            className="w-full bg-gradient-to-t from-rose-500 to-pink-500 rounded-t shadow-sm transition-all duration-500 group-hover:brightness-105"
                            style={{ height: `${outgoingPct}%` }}
                          />
                          {/* Tooltip on Hover */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 dark:bg-black text-white text-[9px] py-1 px-1.5 rounded font-mono shadow-md z-10 whitespace-nowrap">
                            Desp: R$ {data.despesas.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                          </div>
                        </div>
                      </div>
                      <span className="mt-3 text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
                        {data.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                <p className="text-xs">Aguardando dados nos meses para renderizar gráfico comparativo.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Two cards lower: Limites e Alertas & Divisão de Pagamento */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        
        {/* Budget Limit Progress Bars */}
        <div className="rounded-2xl bg-white p-5 border border-slate-100 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-50 dark:border-slate-800">
            <div>
              <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                Controle de Teto Orçamentário
              </h4>
              <p className="text-[10px] text-slate-400">Acompanhamento de tetos mensais por Categoria</p>
            </div>
            <span className="text-[10px] font-mono bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 py-0.5 px-2 rounded-md">
              Aviso &gt; 80%
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {budgets.map((b) => {
              const spent = gastosPorCategoria[b.category] || 0;
              const pct = b.limitValue > 0 ? (spent / b.limitValue) * 100 : 0;
              const isAlert = pct >= 100;
              const isWarning = pct >= 80 && pct < 100;

              return (
                <div key={b.category} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{b.category}</span>
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      R$ {spent.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} / <span className="font-bold">R$ {b.limitValue}</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isAlert 
                          ? 'bg-gradient-to-r from-rose-500 to-red-650' 
                          : isWarning 
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500' 
                            : 'bg-gradient-to-r from-indigo-500 to-indigo-450'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono leading-none">
                    <span>{pct.toFixed(0)}% preenchido</span>
                    {isAlert ? (
                      <span className="text-rose-500 font-bold uppercase flex items-center gap-0.5 animate-pulse">
                        <AlertTriangle className="h-2.5 w-2.5" /> Limite Excedido
                      </span>
                    ) : isWarning ? (
                      <span className="text-amber-500 font-semibold uppercase">Perto do limite</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Health (Pago, Pendente, Atrasado segment) */}
        <div className="rounded-2xl bg-white p-5 border border-slate-100 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-50 dark:border-slate-800">
              <div>
                <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  Controle de Liquidez e Vencimentos
                </h4>
                <p className="text-[10px] text-slate-400">Proporção e cumprimento de despesas</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {/* Stacked indicator bar */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Partição Real / Estimado ({totalGastos > 0 ? 'R$ ' + totalGastos.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : 'R$ 0'})</p>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-lg overflow-hidden flex shadow-inner">
                  {totalGastos > 0 ? (
                    <>
                      {gastosPagos > 0 && (
                        <div 
                          className="bg-emerald-500 h-full hover:opacity-90 transition cursor-help relative group"
                          style={{ width: `${(gastosPagos / totalGastos) * 100}%` }}
                          title={`Pago: R$ ${gastosPagos}`}
                        >
                          <span className="hidden sm:block absolute inset-0 text-center text-[9px] font-mono text-white leading-4 truncate px-1">
                            {((gastosPagos / totalGastos) * 100).toFixed(0)}% Pago
                          </span>
                        </div>
                      )}
                      {gastosPendentes > 0 && (
                        <div 
                          className="bg-amber-400 h-full hover:opacity-90 transition cursor-help relative group"
                          style={{ width: `${(gastosPendentes / totalGastos) * 100}%` }}
                          title={`Pendente: R$ ${gastosPendentes}`}
                        >
                          <span className="hidden sm:block absolute inset-0 text-center text-[9px] font-mono text-slate-900 leading-4 truncate px-1">
                            {((gastosPendentes / totalGastos) * 100).toFixed(0)}% Pend
                          </span>
                        </div>
                      )}
                      {gastosAtrasados > 0 && (
                        <div 
                          className="bg-rose-500 h-full hover:opacity-90 transition cursor-help relative group"
                          style={{ width: `${(gastosAtrasados / totalGastos) * 100}%` }}
                          title={`Atrasado: R$ ${gastosAtrasados}`}
                        >
                          <span className="hidden sm:block absolute inset-0 text-center text-[9px] font-mono text-white leading-4 truncate px-1">
                            {((gastosAtrasados / totalGastos) * 100).toFixed(0)}% Atr
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-medium">Sem despesas no mês</div>
                  )}
                </div>
              </div>

              {/* Individual Details */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="rounded-xl p-3 bg-emerald-50/50 dark:bg-emerald-950/10 text-center border border-emerald-100/50 dark:border-emerald-950/20">
                  <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500 text-white mb-2">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="block text-[10px] text-slate-400 font-display">Pago</span>
                  <span className="block font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    R$ {gastosPagos.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </span>
                </div>

                <div className="rounded-xl p-3 bg-amber-50/50 dark:bg-amber-950/10 text-center border border-amber-100/50 dark:border-amber-950/20">
                  <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400 text-slate-950 mb-2">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="block text-[10px] text-slate-400 font-display">Pendente</span>
                  <span className="block font-mono text-xs font-bold text-amber-600 dark:text-amber-400 mt-1">
                    R$ {gastosPendentes.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </span>
                </div>

                <div className="rounded-xl p-3 bg-rose-50/50 dark:bg-rose-950/10 text-center border border-rose-100/50 dark:border-rose-950/20">
                  <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500 text-white mb-2">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <span className="block text-[10px] text-slate-400 font-display">Atrasado</span>
                  <span className="block font-mono text-xs font-bold text-rose-500 mt-1">
                    R$ {gastosAtrasados.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs mt-3">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-350">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>Dica: Pague antes do vencimento para manter as contas no azul!</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
