/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  X,
  Plus,
  Building,
  CreditCard
} from 'lucide-react';
import { Transaction, PaymentStatus, ExpenseCategory, RevenueCategory } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onToggleStatus: (id: string, newStatus: PaymentStatus) => void;
}

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
  onAddNew,
  onToggleStatus,
}: TransactionListProps) {
  // Search and Advanced Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'receita' | 'gasto'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [bankFilter, setBankFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Show detailed filters
  const [showFilters, setShowFilters] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<keyof Transaction>('purchaseDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // List categories & banks present for filtering
  const distinctCategories = Array.from(new Set(transactions.map((t) => t.category)));
  const distinctBanks = Array.from(new Set(transactions.map((t) => t.bank)));

  // Handle Sort
  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Check if a transition is soon to expire (Pendente within 3 days: <= 3 days away, and in future or today)
  const isNearDueDate = (tx: Transaction): boolean => {
    if (tx.status !== 'pendente' || tx.type === 'receita') return false;
    const today = new Date('2026-06-17T00:00:00'); // Based on local metadata target 2026-06-17
    const due = new Date(tx.dueDate + 'T00:00:00');
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  // Get status class matching strict color guidelines
  const getStatusStyle = (tx: Transaction) => {
    if (tx.status === 'pago') {
      return {
        bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-805',
        dot: 'bg-emerald-500',
        label: 'Pago'
      };
    }
    if (isNearDueDate(tx)) {
      return {
        bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-805 animate-pulse',
        dot: 'bg-amber-500',
        label: 'Próximo Vencimento (Amarelo)'
      };
    }
    if (tx.status === 'atrasado') {
      return {
        bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-450 border-rose-200 dark:border-rose-805',
        dot: 'bg-rose-500',
        label: 'Atrasado'
      };
    }
    return {
      bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350 border-slate-200 dark:border-slate-750',
      dot: 'bg-slate-400',
      label: 'Pendente'
    };
  };

  // Filter Logic
  const filteredTransactions = transactions
    .filter((tx) => {
      // Search Box matching Name, Category, Bank or Comments
      const matchesSearch = 
        tx.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
      const matchesBank = bankFilter === 'all' || tx.bank === bankFilter;
      
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        if (statusFilter === 'near_due') {
          matchesStatus = isNearDueDate(tx);
        } else {
          matchesStatus = tx.status === statusFilter;
        }
      }

      return matchesSearch && matchesType && matchesCategory && matchesBank && matchesStatus;
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Export to CSV helper
  const exportToCSV = () => {
    const headers = ['Tipo', 'Lançamento', 'Categoria', 'Valor (R$)', 'Data Compra', 'Data Vencimento', 'Status', 'Forma Pagamento', 'Banco', 'Obs'];
    const rows = transactions.map(tx => [
      tx.type === 'gasto' ? 'Despesa' : 'Receita',
      tx.name,
      tx.category,
      tx.value,
      tx.purchaseDate,
      tx.dueDate,
      tx.status.toUpperCase(),
      tx.paymentMethod,
      tx.bank,
      tx.notes || ''
    ]);

    const csvContent = 
      "data:text/csv;charset=utf-8,\uFEFF" + 
      [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Relatorio_Financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setBankFilter('all');
    setStatusFilter('all');
  };

  return (
    <div id="transactions-tab-content" className="space-y-4">
      
      {/* Search & Actions Header Card */}
      <div className="rounded-2xl bg-white p-4 border border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          
          {/* Left search input */}
          <div className="relative flex-1">
            <Search className="absolute inset-y-0 left-3 h-4 w-4 my-auto text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por lançamento, categoria, banco ou obs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 rounded-xl bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Right quick buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 cursor-pointer transition ${
                showFilters || typeFilter !== 'all' || categoryFilter !== 'all' || bankFilter !== 'all' || statusFilter !== 'all'
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'
                  : 'border-slate-200 text-slate-600 dark:border-slate-750 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filtros avançados</span>
            </button>

            <button
              onClick={exportToCSV}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 dark:border-slate-750 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-1.5 cursor-pointer"
            >
              Exportar CSV
            </button>

            <button
              onClick={onAddNew}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-indigo-600/10 transition cursor-pointer animate-press"
            >
              <Plus className="h-4 w-4" />
              <span>Lançamento</span>
            </button>
          </div>

        </div>

        {/* Expandable Advanced Filters Box */}
        {(showFilters || typeFilter !== 'all' || categoryFilter !== 'all' || bankFilter !== 'all' || statusFilter !== 'all') && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 animate-fade-in">
            {/* Type */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Tipo</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full text-xs rounded-lg bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white p-2 border border-slate-200 dark:border-slate-800 focus:outline-none"
              >
                <option value="all">Todos os tipos</option>
                <option value="receita">Receita (Ganho)</option>
                <option value="gasto">Despesa (Gasto)</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Categoria</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full text-xs rounded-lg bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white p-2 border border-slate-200 dark:border-slate-800 focus:outline-none"
              >
                <option value="all">Todas categorias</option>
                {distinctCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Bank */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Banco / Origem</label>
              <select
                value={bankFilter}
                onChange={(e) => setBankFilter(e.target.value)}
                className="w-full text-xs rounded-lg bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white p-2 border border-slate-200 dark:border-slate-800 focus:outline-none"
              >
                <option value="all">Todos os bancos</option>
                {distinctBanks.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Situação</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-xs rounded-lg bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white p-2 border border-slate-200 dark:border-slate-800 focus:outline-none"
              >
                <option value="all">Todos status</option>
                <option value="pago">Pago / Resolvido</option>
                <option value="pendente">Pendente</option>
                <option value="atrasado">Atrasado</option>
                <option value="near_due">Próximo Vencimento</option>
              </select>
            </div>

            {/* Clear option */}
            <div className="sm:col-span-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-[10px] font-mono font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
              >
                <X className="h-3 w-3" /> Limpar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Spreadsheet grid layout of items */}
      <div className="rounded-2xl border border-slate-150 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[700px] border-collapse text-left text-xs text-slate-600 dark:text-slate-350 text-left">
            <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 font-mono text-slate-500 uppercase tracking-wider font-semibold select-none">
              <tr>
                <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleSort('type')}>
                  Tipo
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleSort('name')}>
                  Lançamento
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleSort('category')}>
                  Categoria
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-right" onClick={() => handleSort('value')}>
                  Valor
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleSort('purchaseDate')}>
                  Data Compra/Lançto
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleSort('dueDate')}>
                  Vencimento
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleSort('status')}>
                  Situação
                </th>
                <th className="py-3.5 px-4 text-center">Forma / Banco</th>
                <th className="py-3.5 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => {
                  const sInfo = getStatusStyle(tx);
                  return (
                    <tr 
                      key={tx.id} 
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all font-sans"
                    >
                      {/* TYPE Icon badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {tx.type === 'receita' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
                            <TrendingUp className="h-3 w-3" /> Receita
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full">
                            <TrendingDown className="h-3 w-3" /> Despesa
                          </span>
                        )}
                      </td>

                      {/* Name of Transaction */}
                      <td className="py-3.5 px-4 max-w-[160px] truncate">
                        <p className="font-semibold text-slate-850 dark:text-slate-100 leading-none">{tx.name}</p>
                        {tx.notes && (
                          <span className="text-[10px] text-slate-400 font-normal truncate mt-1 block">
                            {tx.notes}
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          {tx.category}
                        </span>
                      </td>

                      {/* Value with Currency Format */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono font-bold">
                        <span className={tx.type === 'receita' ? 'text-emerald-650' : 'text-slate-900 dark:text-slate-1 p-0.5'}>
                          R$ {tx.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Purchase Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono">
                        {tx.purchaseDate.split('-').reverse().join('/')}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono">
                        {tx.type === 'gasto' ? tx.dueDate.split('-').reverse().join('/') : '-'}
                      </td>

                      {/* Color coded status indicators */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="relative group inline-block">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10.5px] font-bold rounded-full border border-dashed cursor-pointer hover:shadow-xs transition ${sInfo.bg}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${sInfo.dot}`}></span>
                            {tx.status === 'pago' ? 'Pago' : isNearDueDate(tx) ? 'Atenção (3 Dias)' : tx.status === 'atrasado' ? 'Atrasado' : 'Pendente'}
                          </span>
                          
                          {/* Quick Toggle Popover Tooltip for status on click/hover */}
                          {tx.type === 'gasto' && (
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-750 shadow-xl z-30">
                              <p className="text-[9px] font-semibold text-center mb-1 text-slate-400 font-mono">Alterar Status:</p>
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => onToggleStatus(tx.id, 'pago')}
                                  className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[9px] font-bold"
                                >
                                  Pago
                                </button>
                                <button 
                                  onClick={() => onToggleStatus(tx.id, 'pendente')}
                                  className="px-2 py-0.5 bg-amber-450 text-slate-950 rounded text-[9px] font-bold"
                                >
                                  Pendente
                                </button>
                                <button 
                                  onClick={() => onToggleStatus(tx.id, 'atrasado')}
                                  className="px-2 py-0.5 bg-rose-500 text-white rounded text-[9px] font-bold"
                                >
                                  Atraso
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Form of Payment / Bank institution logo style */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col items-center justify-center space-y-0.5 leading-none">
                          <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <CreditCard className="h-3 w-3 shrink-0 text-slate-400" />
                            {tx.status === 'pago' && tx.paidMethod ? tx.paidMethod : tx.paymentMethod}
                          </span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                            <Building className="h-2.5 w-2.5 text-slate-420 shrink-0" />
                            {tx.status === 'pago' && tx.paidBank ? tx.paidBank : tx.bank}
                          </span>
                        </div>
                      </td>

                      {/* EDIT / DELETE Buttons */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onEdit(tx)}
                            className="p-1 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 hover:text-slate-750 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
                            title="Editar Lançamento"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(tx.id)}
                            className="p-1 rounded bg-rose-50/50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-500 hover:text-rose-650 transition cursor-pointer"
                            title="Excluir Lançamento"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    Nenhum lançamento corresponde aos filtros ativos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
