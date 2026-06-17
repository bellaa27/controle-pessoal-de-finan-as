/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Wallet, RefreshCw, FileText, Check } from 'lucide-react';
import { 
  Transaction, 
  TransactionType, 
  ExpenseCategory, 
  RevenueCategory, 
  PaymentMethod, 
  BankInstitution, 
  PaymentStatus 
} from '../types';

interface TransactionFormProps {
  transaction?: Transaction | null; // If editing, otherwise null for new
  onSave: (tx: Partial<Transaction> & { id?: string }) => void;
  onClose: () => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Alimentação', 'Transporte', 'Educação', 'Lazer', 'Saúde', 'Moradia', 'Outros'
];

const REVENUE_CATEGORIES: RevenueCategory[] = [
  'Salário', 'Freelance', 'Investimentos', 'Reembolso', 'Outros'
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'Dinheiro', 'PIX', 'Cartão de Débito', 'Cartão de Crédito', 'Boleto', 'Transferência Bancária'
];

const BANKS: BankInstitution[] = [
  'Nubank', 'Banco do Brasil', 'Caixa', 'Itaú', 'Bradesco', 'Santander', 'Inter', 'Sicredi', 'Cooperativas', 'Outros'
];

export default function TransactionForm({ transaction, onSave, onClose }: TransactionFormProps) {
  // Common states
  const [type, setType] = useState<TransactionType>('gasto');
  const [name, setName] = useState('');
  const [value, setValue] = useState<number | ''>('');
  const [category, setCategory] = useState<string>('Outros');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [bank, setBank] = useState<BankInstitution>('Nubank');
  const [status, setStatus] = useState<PaymentStatus>('pendente');

  // Realized payment states (conditional field check)
  const [paymentDate, setPaymentDate] = useState('');
  const [paidMethod, setPaidMethod] = useState<PaymentMethod>('PIX');
  const [paidBank, setPaidBank] = useState<BankInstitution>('Nubank');

  // Load editing transaction if exists
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (transaction) {
      setType(transaction.type);
      setName(transaction.name);
      setValue(transaction.value);
      setCategory(transaction.category);
      setPurchaseDate(transaction.purchaseDate);
      setDueDate(transaction.dueDate);
      setNotes(transaction.notes || '');
      setPaymentMethod(transaction.paymentMethod);
      setBank(transaction.bank);
      setStatus(transaction.status);
      
      setPaymentDate(transaction.paymentDate || today);
      setPaidMethod(transaction.paidMethod || transaction.paymentMethod);
      setPaidBank(transaction.paidBank || transaction.bank);
    } else {
      // Defaults for new transaction
      setType('gasto');
      setName('');
      setValue('');
      setCategory('Outros');
      setPurchaseDate(today);
      setDueDate(today);
      setNotes('');
      setPaymentMethod('PIX');
      setBank('Nubank');
      setStatus('pendente');
      
      setPaymentDate(today);
      setPaidMethod('PIX');
      setPaidBank('Nubank');
    }
  }, [transaction]);

  // Sync category on type change to avoid mismatch
  useEffect(() => {
    if (!transaction) {
      setCategory(type === 'gasto' ? 'Alimentação' : 'Salário');
    }
  }, [type, transaction]);

  // Auto-set status or payment date when toggling
  const handleStatusChange = (newStatus: PaymentStatus) => {
    setStatus(newStatus);
    if (newStatus === 'pago' && !paymentDate) {
      const today = new Date().toISOString().split('T')[0];
      setPaymentDate(today);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (typeof value !== 'number' || value <= 0) return;

    const data: Partial<Transaction> & { id?: string } = {
      type,
      name,
      value,
      category: category as any,
      purchaseDate,
      dueDate: type === 'receita' ? purchaseDate : dueDate, // Receita has equal dates by default
      notes,
      paymentMethod,
      bank,
      status,
      id: transaction?.id
    };

    if (status === 'pago') {
      data.paymentDate = paymentDate || purchaseDate;
      data.paidMethod = paidMethod;
      data.paidBank = paidBank;
    } else {
      // Clear payment details if not paid
      data.paymentDate = undefined;
      data.paidMethod = undefined;
      data.paidBank = undefined;
    }

    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl transition-colors duration-300">
        
        {/* Header Close */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-display text-base font-bold text-slate-950 dark:text-white">
            {transaction ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Type Toggle Tabs */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setType('gasto')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${
                type === 'gasto'
                  ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-355'
              }`}
            >
              Despesa (Gasto 💸)
            </button>
            <button
              type="button"
              onClick={() => setType('receita')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${
                type === 'receita'
                  ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-355'
              }`}
            >
              Receita (Ganho 💰)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Title / Name */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Nome do Lançamento *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Aluguel, Supermercado, Salário CLT"
                  className="w-full text-sm rounded-lg bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            {/* Value (R$) */}
            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Valor * (R$)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-505">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  value={value === '' ? '' : value}
                  onChange={(e) => setValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="0,00"
                  className="w-full text-sm pl-9 rounded-lg bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Categoria *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm rounded-lg bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white px-3 py-2.5 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {type === 'gasto'
                  ? EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))
                  : REVENUE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
              </select>
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {type === 'gasto' ? 'Data de Compra' : 'Data de Recebimento'} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <input
                  type="date"
                  required
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full text-sm pl-9 rounded-lg bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white px-3 py-2.5 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                />
              </div>
            </div>

            {/* Due Date (show only for expenses) */}
            {type === 'gasto' ? (
              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Data de Vencimento *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Calendar className="h-4 w-4 text-rose-455" />
                  </div>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-sm pl-9 rounded-lg bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white px-3 py-2.5 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <div className="hidden"></div>
            )}

            {/* Form Payment Selection */}
            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Planejado: Forma Pagto
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full text-sm rounded-lg bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white px-3 py-2.5 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Institution selection */}
            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Banco / Destino
              </label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value as BankInstitution)}
                className="w-full text-sm rounded-lg bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white px-3 py-2.5 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Selection Row */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Situação e Status
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange('pago')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition ${
                    status === 'pago'
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${status === 'pago' ? 'bg-white' : 'bg-emerald-500'}`}></span>
                  Pago / Liquidado
                </button>
                
                {type === 'gasto' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('pendente')}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition ${
                        status === 'pendente'
                          ? 'bg-amber-450 hover:bg-amber-500 text-slate-950'
                          : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${status === 'pendente' ? 'bg-slate-950' : 'bg-amber-450'}`}></span>
                      Pendente
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange('atrasado')}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition ${
                        status === 'atrasado'
                          ? 'bg-rose-500 hover:bg-rose-600 text-white'
                          : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${status === 'atrasado' ? 'bg-white' : 'bg-rose-500'}`}></span>
                      Atrasado
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Collapsible Paid details when status is "pago" */}
            {status === 'pago' && (
              <div className="sm:col-span-2 p-3.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/10 dark:border-emerald-800 space-y-3 animate-fade-in">
                <span className="block text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-450 uppercase tracking-widest flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Informações de Realização
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                      Data do Pagto
                    </label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full text-xs rounded-lg bg-white dark:bg-slate-850 text-slate-900 dark:text-white p-2 border border-slate-200 dark:border-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                      Forma Utilizada
                    </label>
                    <select
                      value={paidMethod}
                      onChange={(e) => setPaidMethod(e.target.value as PaymentMethod)}
                      className="w-full text-xs rounded-lg bg-white dark:bg-slate-850 text-slate-900 dark:text-white p-2 border border-slate-200 dark:border-slate-800 focus:outline-none"
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                      Banco Utilizado
                    </label>
                    <select
                      value={paidBank}
                      onChange={(e) => setPaidBank(e.target.value as BankInstitution)}
                      className="w-full text-xs rounded-lg bg-white dark:bg-slate-850 text-slate-900 dark:text-white p-2 border border-slate-200 dark:border-slate-800 focus:outline-none"
                    >
                      {BANKS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notes / Comments */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Observações (Opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex decomposição, parcelas, dados adicionais da transação"
                rows={2}
                className="w-full text-sm rounded-lg bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

          </div>

          {/* Form Actions footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-5">
            <button
               type="button"
               onClick={onClose}
               className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 transition rounded-lg cursor-pointer animate-press"
            >
              Cancelar
            </button>
            <button
               type="submit"
               className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 font-sans transition rounded-lg shadow-md shadow-indigo-650/10 cursor-pointer animate-press"
            >
              Confirmar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
