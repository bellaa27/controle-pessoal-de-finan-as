/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  PiggyBank, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Compass, 
  TrendingUp as TrendSymbol, 
  DollarSign, 
  PieChart as ChartIcon,
  Sparkles,
  Calendar
} from 'lucide-react';
import { SavingGoal, Transaction, BudgetLimit } from '../types';

interface GoalPlannerProps {
  goals: SavingGoal[];
  transactions: Transaction[];
  budgets: BudgetLimit[];
  onAddGoal: (goal: Omit<SavingGoal, 'id'>) => void;
  onDeleteGoal: (id: string) => void;
  onModifyGoalProgress: (id: string, amount: number) => void;
  monthlyEconomyGoal: number;
  onUpdateMonthlyEconomyGoal: (amt: number) => void;
}

export default function GoalPlanner({
  goals,
  transactions,
  budgets,
  onAddGoal,
  onDeleteGoal,
  onModifyGoalProgress,
  monthlyEconomyGoal,
  onUpdateMonthlyEconomyGoal,
}: GoalPlannerProps) {
  // Goal creation state
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState<number | ''>('');
  const [newGoalCurrent, setNewGoalCurrent] = useState<number | ''>('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  const [newGoalNotes, setNewGoalNotes] = useState('');

  // Quick contribute state
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState<number | ''>('');

  // Forecast settings
  const [forecastMonths, setForecastMonths] = useState(3);

  // Future Forecasting Calculations
  const totalReceitas = transactions
    .filter(t => t.type === 'receita')
    .reduce((acc, t) => acc + t.value, 0);

  const totalGastos = transactions
    .filter(t => t.type === 'gasto')
    .reduce((acc, t) => acc + t.value, 0);

  // Group by distinct months in transactions
  const monthsList = Array.from(new Set(transactions.map((t) => {
    return t.purchaseDate.substring(0, 7); // YYYY-MM
  }))).sort();

  const numMonths = Math.max(1, monthsList.length);
  const avgIncome = totalReceitas / numMonths;
  const avgExpense = totalGastos / numMonths;
  const avgSavings = avgIncome - avgExpense;

  // Budget Limits caps
  const budgetedTotal = budgets.reduce((acc, b) => acc + b.limitValue, 0);

  // Goal submission handler
  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName.trim() || !newGoalTarget || !newGoalDeadline) return;

    onAddGoal({
      name: newGoalName,
      targetValue: Number(newGoalTarget),
      currentValue: Number(newGoalCurrent || 0),
      deadline: newGoalDeadline,
      notes: newGoalNotes
    });

    // Reset
    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalCurrent('');
    setNewGoalDeadline('');
    setNewGoalNotes('');
    setShowGoalForm(false);
  };

  const handleContributeSubmit = (id: string) => {
    if (!contributeAmount || typeof contributeAmount !== 'number' || contributeAmount <= 0) return;
    onModifyGoalProgress(id, contributeAmount);
    setContributeAmount('');
    setContributeGoalId(null);
  };

  return (
    <div id="goals-tab-content" className="space-y-6">

      {/* Monthly Economy Goal Panel */}
      <div className="rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-500 p-5 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-display font-bold text-base flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              Metas de Economia Mensal e Orçamento Geral
            </h4>
            <p className="text-xs text-indigo-50/90 max-w-xl">
              Defina o quanto você quer guardar líquido por mês. O monitoramento automático indicará se seu saldo atual atende essa pretensão.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-semibold">Meta Mensal:</span>
            <div className="relative">
              <span className="absolute inset-y-0 left-2.5 flex items-center font-mono text-xs text-indigo-600 font-bold">R$</span>
              <input
                type="number"
                value={monthlyEconomyGoal === 0 ? '' : monthlyEconomyGoal}
                onChange={(e) => onUpdateMonthlyEconomyGoal(Number(e.target.value))}
                placeholder="Ex: 500"
                className="bg-white/95 text-slate-850 text-xs font-mono font-bold pl-8 pr-3 py-1.5 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-indigo-700 w-28"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 text-xs border-t border-white/20">
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs">
            <span className="block text-indigo-100 uppercase tracking-widest text-[9px] font-mono mb-1">Seu Saldo Mensal Atual</span>
            <span className="font-mono text-base font-bold">R$ {(totalReceitas - totalGastos).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs">
            <span className="block text-indigo-100 uppercase tracking-widest text-[9px] font-mono mb-1">Sua Meta Determinada</span>
            <span className="font-mono text-base font-bold">R$ {monthlyEconomyGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs">
            <span className="block text-indigo-100 uppercase tracking-widest text-[9px] font-mono mb-1">Status de Conclusão</span>
            <span className="font-semibold block mt-1">
              {(totalReceitas - totalGastos) >= monthlyEconomyGoal ? (
                <span className="bg-emerald-600/65 text-white px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold tracking-tight">Meta Atingida 🎉</span>
              ) : (
                <span className="bg-rose-500/65 text-white px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold tracking-tight">Faltam R$ {Math.max(0, monthlyEconomyGoal - (totalReceitas - totalGastos)).toFixed(0)}</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Savings Goals Grid section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">Seus Objetivos de Poupar / Reserva</h3>
            <p className="text-[11px] text-slate-400">Gerenciamento de sonhos e fundos de investimentos</p>
          </div>
          
          <button
            onClick={() => setShowGoalForm(!showGoalForm)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Novo Objetivo
          </button>
        </div>

        {/* Goal Form */}
        {showGoalForm && (
          <form onSubmit={handleCreateGoal} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg space-y-3.5 max-w-xl animate-fade-in">
            <h4 className="font-display font-medium text-xs text-slate-800 dark:text-slate-100">Adicionar Novo Objetivo Financeiro</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-0.5">Nome do Objetivo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Novo carro, Reserva"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border text-sm bg-slate-50 border-slate-200 dark:bg-slate-850 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-0.5">Valor Alvo (R$) *</label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 10000"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border text-sm bg-slate-50 border-slate-200 dark:bg-slate-850 dark:border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-0.5">Valor Já Guardado (R$)</label>
                <input
                  type="number"
                  placeholder="Ex: 500"
                  value={newGoalCurrent}
                  onChange={(e) => setNewGoalCurrent(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border text-sm bg-slate-50 border-slate-200 dark:bg-slate-850 dark:border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-0.5">Data Limite / Prazo *</label>
                <input
                  type="date"
                  required
                  value={newGoalDeadline}
                  onChange={(e) => setNewGoalDeadline(e.target.value)}
                  className="w-full p-2 rounded-lg border text-sm bg-slate-50 border-slate-200 dark:bg-slate-850 dark:border-slate-800 focus:outline-none cursor-pointer"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-0.5">Notas / Instruções</label>
                <textarea
                  placeholder="Ex: Alocar liquidez CDB"
                  value={newGoalNotes}
                  onChange={(e) => setNewGoalNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-lg border text-sm bg-slate-50 border-slate-200 dark:bg-slate-850 dark:border-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setShowGoalForm(false)}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-500 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold shadow cursor-pointer"
              >
                Criar
              </button>
            </div>
          </form>
        )}

        {/* Goals List Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((g) => {
            const pct = g.targetValue > 0 ? (g.currentValue / g.targetValue) * 100 : 0;
            const remaining = Math.max(0, g.targetValue - g.currentValue);
            const isContributeActive = contributeGoalId === g.id;

            return (
              <div 
                key={g.id} 
                className="rounded-2xl border border-slate-150 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-650 dark:bg-indigo-950/20 dark:text-indigo-400 flex items-center justify-center">
                        <PiggyBank className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-xs text-slate-850 dark:text-slate-100 leading-none">
                          {g.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Limite: {g.deadline.split('-').reverse().join('/')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteGoal(g.id)}
                      className="p-1 rounded text-red-400 hover:text-red-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                      title="Excluir Objetivo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {g.notes && (
                    <p className="text-[11px] text-slate-450 dark:text-slate-400 font-medium italic">
                      "{g.notes}"
                    </p>
                  )}

                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-400">Progresso</span>
                      <span className="text-slate-600 dark:text-slate-350 font-bold">
                        R$ {g.currentValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} / R$ {g.targetValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </span>
                    </div>

                    {/* Progress slider layout */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] font-mono leading-none pt-0.5">
                      <span className="text-indigo-650 dark:text-indigo-400 font-bold">{pct.toFixed(0)}% preenchido</span>
                      <span className="text-slate-400 font-light">Falta R$ {remaining.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800">
                  {isContributeActive ? (
                    <div className="flex gap-2 text-xs animate-fade-in">
                      <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-2.5 flex items-center font-mono text-[10px] text-slate-400">R$</span>
                        <input
                          type="number"
                          autoFocus
                          placeholder="Valor de aporte"
                          value={contributeAmount === '' ? '' : contributeAmount}
                          onChange={(e) => setContributeAmount(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full text-xs pl-7 pr-1.5 py-1.5 rounded-lg border border-slate-200 dark:bg-slate-850 dark:border-slate-850 focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => handleContributeSubmit(g.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
                      >
                        Aportar
                      </button>
                      <button
                        onClick={() => setContributeGoalId(null)}
                        className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300 font-semibold px-2 rounded-lg cursor-pointer"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setContributeGoalId(g.id)}
                      className="w-full py-1.5 text-xs text-center font-semibold bg-slate-50 text-slate-650 hover:bg-slate-100 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-750 transition rounded-lg cursor-pointer"
                    >
                      + Aporte Financeiro rápido
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial forecasting / Planejamento financeiro futuro */}
      <div className="rounded-2xl border border-slate-150 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-50 dark:border-slate-800">
          <div>
            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-sky-400" />
              Previsão de Gastos Futuros e Simulação
            </h4>
            <p className="text-[10px] text-slate-400">Projeção estimada com base na média histórica registrada</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono">Simular:</span>
            <select
              value={forecastMonths}
              onChange={(e) => setForecastMonths(Number(e.target.value))}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded font-sans cursor-pointer focus:outline-none"
            >
              <option value={3}>Próximos 3 meses</option>
              <option value={6}>Próximos 6 meses</option>
              <option value={12}>Próximo ano inteiro</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Forecaster details cards */}
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/55 dark:border-emerald-900/30 flex items-start gap-3">
            <div className="p-2 rounded bg-emerald-500 text-white">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-0.5">
              <span className="block text-[10px] text-emerald-800 dark:text-emerald-400 uppercase tracking-widest font-bold">Patrimônio Previsto (Receitas)</span>
              <span className="font-mono text-base font-bold text-slate-800 dark:text-slate-100">
                R$ {(avgIncome * forecastMonths).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </span>
              <p className="text-[9px] text-slate-400">Estimado R$ {avgIncome.toFixed(0)}/mês</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100/55 dark:border-rose-900/30 flex items-start gap-3">
            <div className="p-2 rounded bg-rose-500 text-white">
              <TrendingDown className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-0.5">
              <span className="block text-[10px] text-rose-800 dark:text-rose-455 uppercase tracking-widest font-bold">Despesas Estimadas</span>
              <span className="font-mono text-base font-bold text-slate-800 dark:text-slate-100">
                R$ {(avgExpense * forecastMonths).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </span>
              <p className="text-[9px] text-slate-400">Estimado R$ {avgExpense.toFixed(0)}/mês</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded bg-sky-500 text-white">
              <Compass className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-0.5 flex-1">
              <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold">Poupança Prevista Total</span>
              <span className="font-mono text-base font-bold text-slate-800 dark:text-slate-100 block">
                R$ {(avgSavings * forecastMonths).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </span>
              <div className="mt-1 w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                <div 
                  className={`h-1 rounded-full ${avgSavings >= 0 ? 'bg-sky-500' : 'bg-rose-500'}`} 
                  style={{ width: `${avgSavings >= 0 ? Math.min(100, (avgSavings / (avgIncome || 1)) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Warning and advisory */}
        <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl text-xs space-y-1 text-slate-600 dark:text-slate-300">
          <p className="font-semibold text-slate-800 dark:text-slate-200">Recomendação do Sistema de Projeção:</p>
          {avgSavings > 0 ? (
            <p className="text-[11px] leading-relaxed">
              Com base nos seus hábitos atuais de gastos (R$ {avgExpense.toFixed(0)} mensais) e receitas (R$ {avgIncome.toFixed(0)} mensais), seu saldo mensal médio é de <b className="text-emerald-500 font-mono">R$ {avgSavings.toFixed(0)}</b> positivo!
              Se você mantiver esse padrão pelos próximos <b>{forecastMonths} meses</b>, você conseguirá preencher com folga seus objetivos e economizar o total de <b>R$ {(avgSavings * forecastMonths).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</b>.
            </p>
          ) : (
            <p className="text-[11px] leading-relaxed text-rose-500">
              Atenção! Seu histórico financeiro atual registra uma média de deficit (R$ {avgSavings.toFixed(0)} negativo).
              Projetado para {forecastMonths} meses, isso pode resultar em acúmulo de débitos no valor de <b>R$ {Math.abs(avgSavings * forecastMonths).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</b>. Recomenda-se reduzir o teto de gastos fixos ou orçamentos de lazer.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
