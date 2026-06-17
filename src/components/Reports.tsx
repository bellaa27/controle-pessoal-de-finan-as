/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BarChart, 
  CreditCard, 
  Building, 
  Layers, 
  Download, 
  FileSpreadsheet, 
  FileText,
  Printer, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Transaction, PaymentMethod, BankInstitution, ExpenseCategory } from '../types';

interface ReportsProps {
  transactions: Transaction[];
}

export default function Reports({ transactions }: ReportsProps) {
  const [activeReportTab, setActiveReportTab] = useState<'category' | 'method' | 'bank'>('category');

  const despesasList = transactions.filter(t => t.type === 'gasto');
  const totalDespesas = despesasList.reduce((sum, t) => sum + t.value, 0);

  // Group by Category
  const categoryStats: Record<string, { value: number; count: number }> = {};
  despesasList.forEach(tx => {
    if (!categoryStats[tx.category]) {
      categoryStats[tx.category] = { value: 0, count: 0 };
    }
    categoryStats[tx.category].value += tx.value;
    categoryStats[tx.category].count += 1;
  });

  // Group by Payment Method
  const methodStats: Record<string, { value: number; count: number }> = {};
  despesasList.forEach(tx => {
    // If paid, use actual paidMethod, otherwise default layout paymentMethod
    const method = tx.status === 'pago' && tx.paidMethod ? tx.paidMethod : tx.paymentMethod;
    if (!methodStats[method]) {
      methodStats[method] = { value: 0, count: 0 };
    }
    methodStats[method].value += tx.value;
    methodStats[method].count += 1;
  });

  // Group by Bank
  const bankStats: Record<string, { value: number; count: number }> = {};
  despesasList.forEach(tx => {
    const bank = tx.status === 'pago' && tx.paidBank ? tx.paidBank : tx.bank;
    if (!bankStats[bank]) {
      bankStats[bank] = { value: 0, count: 0 };
    }
    bankStats[bank].value += tx.value;
    bankStats[bank].count += 1;
  });

  // Convert stats to sorted arrays
  const sortedCategories = Object.entries(categoryStats)
    .map(([name, stat]) => ({ name, value: stat.value, count: stat.count, pct: totalDespesas > 0 ? (stat.value / totalDespesas) * 100 : 0 }))
    .sort((a, b) => b.value - a.value);

  const sortedMethods = Object.entries(methodStats)
    .map(([name, stat]) => ({ name, value: stat.value, count: stat.count, pct: totalDespesas > 0 ? (stat.value / totalDespesas) * 100 : 0 }))
    .sort((a, b) => b.value - a.value);

  const sortedBanks = Object.entries(bankStats)
    .map(([name, stat]) => ({ name, value: stat.value, count: stat.count, pct: totalDespesas > 0 ? (stat.value / totalDespesas) * 100 : 0 }))
    .sort((a, b) => b.value - a.value);

  // Trigger Print Setup (converts cleanly to PDF via OS layout)
  const handlePrint = () => {
    window.print();
  };

  // Export CSV Helper
  const handleCSVExport = () => {
    const csvRows = [
      ['ID', 'Tipo', 'Nome', 'Categoria', 'Valor (R$)', 'Data Compra', 'Data Vencimento', 'Status', 'Forma Pagamento', 'Banco', 'Observações'].join(';')
    ];

    transactions.forEach(t => {
      csvRows.push([
        t.id,
        t.type === 'gasto' ? 'Despesa' : 'Receita',
        t.name,
        t.category,
        t.value.toFixed(2),
        t.purchaseDate,
        t.dueDate,
        t.status.toUpperCase(),
        t.status === 'pago' && t.paidMethod ? t.paidMethod : t.paymentMethod,
        t.status === 'pago' && t.paidBank ? t.paidBank : t.bank,
        t.notes || ''
      ].join(';'));
    });

    const blob = new Blob(["\uFEFF" + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Export_Financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="reports-tab-content" className="space-y-6">

      {/* Export & Actions Ribbons */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl gap-4 shadow-sm">
        <div>
          <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">Gerador de Relatórios Consolidados</h3>
          <p className="text-[10px] text-slate-400">Exporte todas as suas despesas para contabilidade pessoal externa</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCSVExport}
            className="flex-1 sm:flex-initial text-xs font-semibold px-4 py-2 border border-slate-200 text-slate-600 dark:border-slate-750 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
            <span>Exportar Excel (CSV)</span>
          </button>
          
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer animate-press"
          >
            <Printer className="h-4 w-4" />
            <span>Emitir PDF / Imprimir</span>
          </button>
        </div>
      </div>

      {/* Analytics Tabs and Charts */}
      <div className="rounded-2xl border border-slate-150 bg-white p-5 dark:border-slate-805 dark:bg-slate-900 shadow-xs">
        
        {/* Toggle tabs headers */}
        <div className="flex border-b border-slate-100 dark:border-slate-850 pb-3 mb-5 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveReportTab('category')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeReportTab === 'category'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400'
                : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Por Categoria</span>
          </button>

          <button
            onClick={() => setActiveReportTab('method')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeReportTab === 'method'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400'
                : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Por Forma de Pagamento</span>
          </button>

          <button
            onClick={() => setActiveReportTab('bank')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeReportTab === 'bank'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400'
                : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            <Building className="h-4 w-4" />
            <span>Por Banco / Instituição</span>
          </button>
        </div>

        {/* Selected View Table/Chart render */}
        {totalDespesas > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              {/* Detailed progress list bar */}
              <div className="space-y-4">
                <span className="block text-[10px] font-mono font-bold uppercase text-slate-400">Detalhamento dos Lançamentos</span>
                
                <div className="space-y-3.5">
                  {(activeReportTab === 'category' ? sortedCategories : activeReportTab === 'method' ? sortedMethods : sortedBanks).map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-705 dark:text-slate-300">{item.name} <span className="text-[10px] text-slate-400">({item.count} un)</span></span>
                        <span className="font-mono text-slate-900 dark:text-white font-bold">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                        <span>Representa {item.pct.toFixed(1)}% do total</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Side SVG Chart rendering */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-150 dark:border-slate-800/50">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-6">Mapeamento Visual Gráfico</span>
                
                {/* Visual Segment bars chart */}
                <div className="w-full max-w-[280px] space-y-3 h-48 flex flex-col justify-end">
                  <div className="flex items-end justify-around h-32 pt-2">
                    {(activeReportTab === 'category' ? sortedCategories : activeReportTab === 'method' ? sortedMethods : sortedBanks).slice(0, 5).map((item, idx) => {
                      const maxVal = Math.max(
                        ...(activeReportTab === 'category' ? sortedCategories : activeReportTab === 'method' ? sortedMethods : sortedBanks).map(i => i.value),
                        1
                      );
                      const barPct = (item.value / maxVal) * 100;
                      return (
                        <div key={idx} className="flex flex-col items-center justify-end h-full group w-12">
                          <div className="relative w-4 select-none h-full flex items-end">
                            <div 
                              className="w-full bg-indigo-600 rounded-t shadow-sm transition-all duration-300 group-hover:brightness-105"
                              style={{ height: `${barPct}%` }}
                            />
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 text-white text-[9px] py-1 px-1.5 rounded font-mono shadow z-10 whitespace-nowrap">
                              R$ {item.value.toFixed(0)}
                            </div>
                          </div>
                          <span 
                            className="mt-3 text-[9px] font-mono text-slate-400 truncate max-w-full text-center" 
                            title={item.name}
                          >
                            {item.name.slice(0, 6)}..
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 text-[10px] text-slate-400 text-center uppercase tracking-wide font-mono">
                  Top 5 Fontes de Custo
                </div>

              </div>

            </div>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400">
            <p className="text-xs">Não existem despesas no mês corrente para computar análises de relatórios.</p>
          </div>
        )}

      </div>

    </div>
  );
}
