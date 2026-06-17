/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sun, Moon, Bell, Calendar, User, ChevronDown, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { UserAccount, Transaction } from '../types';

interface HeaderProps {
  accounts: UserAccount[];
  activeAccountId: string;
  onSelectAccount: (id: string) => void;
  selectedMonth: string; // "YYYY-MM" or "all"
  monthsList: { value: string; label: string }[];
  onMonthChange: (month: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  // Notification warnings
  overdueCount: number;
  upcomingCount: number;
  isBudgetExceeded: boolean;
  budgetAlerts: string[];
  overdueTransactions: Transaction[];
  upcomingTransactions: Transaction[];
  onMarkAsPaid: (id: string) => void;
}

export default function Header({
  accounts,
  activeAccountId,
  onSelectAccount,
  selectedMonth,
  monthsList,
  onMonthChange,
  theme,
  toggleTheme,
  overdueCount,
  upcomingCount,
  isBudgetExceeded,
  budgetAlerts,
  overdueTransactions,
  upcomingTransactions,
  onMarkAsPaid,
}: HeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showBellDropdown, setShowBellDropdown] = useState(false);

  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0] || {
    id: 'placeholder',
    name: 'Carregando...',
    email: '',
    avatarColor: 'bg-indigo-600',
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Logo & Meta Info */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <span className="font-display text-xl font-bold">F</span>
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              FinTrack Pro
            </h1>
            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
              Gestão de Fluxo Inteligente
            </span>
          </div>
        </div>

        {/* Center: Month Selector */}
        <div className="hidden md:flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-semibold text-slate-555 dark:text-slate-450 uppercase tracking-wider">
            Período:
          </span>
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="appearance-none font-sans text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 pl-3 pr-8 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">Histórico Completo</option>
              {monthsList.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-500 dark:text-slate-400">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Right Side: Tools, Notifications, Theme, Profile */}
        <div className="flex items-center space-x-4">
          
          {/* Mobile Month Dropdown */}
          <div className="md:hidden">
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="font-sans text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Completo</option>
              {monthsList.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.value.split('-')[1]}/{m.value.split('-')[0].slice(-2)}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Toggler */}
          <button
            onClick={toggleTheme}
            id="theme-toggler-btn"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-all cursor-pointer"
            title="Alternar Tema"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          {/* Notifications Alert Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowBellDropdown(!showBellDropdown);
                setShowUserDropdown(false);
              }}
              id="notifications-bell-btn"
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-all relative cursor-pointer"
              title="Lembretes e Alertas"
            >
              <Bell className="h-5 w-5" />
              {(overdueCount > 0 || upcomingCount > 0 || isBudgetExceeded) && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
              )}
            </button>

            {/* Bell Dropdown */}
            {showBellDropdown && (
              <div 
                id="bell-dropdown-list"
                className="absolute right-0 mt-3 w-80 sm:w-96 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-3 z-50 text-slate-800 dark:text-slate-200"
              >
                <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="font-display font-bold text-sm">Notificações e Alertas</span>
                  <span className="text-[10px] font-mono bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 px-2 py-0.5 rounded">
                    {overdueCount + upcomingCount + (isBudgetExceeded ? 1 : 0)} alertas
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto mt-2">
                  {/* Budget Alert */}
                  {isBudgetExceeded && (
                    <div className="px-4 py-2.5 bg-rose-50/70 dark:bg-rose-950/20 border-b border-rose-100/50 dark:border-rose-950/30 flex gap-2.5">
                      <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-rose-800 dark:text-rose-300">Orçamento em Perigo!</p>
                        {budgetAlerts.map((msg, i) => (
                          <p key={i} className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
                            {msg}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Overdue Alerts */}
                  {overdueTransactions.length > 0 && (
                    <div className="border-b border-slate-100 dark:border-slate-800">
                      <div className="px-4 py-1 text-[10px] font-mono text-rose-500 uppercase tracking-wider bg-rose-50/30 dark:bg-rose-950/10">
                        Atrasadas ({overdueCount})
                      </div>
                      {overdueTransactions.map((tx) => (
                        <div key={tx.id} className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex justify-between items-start text-xs">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{tx.name}</p>
                            <p className="text-slate-500 dark:text-slate-400">
                              Venceu em {tx.dueDate.split('-').reverse().join('/')} • <b className="text-rose-500">R$ {tx.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b>
                            </p>
                          </div>
                          <button
                            onClick={() => onMarkAsPaid(tx.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-[10px] font-medium transition cursor-pointer"
                          >
                            Pagar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upcoming Alerts */}
                  {upcomingTransactions.length > 0 && (
                    <div>
                      <div className="px-4 py-1 text-[10px] font-mono text-amber-500 uppercase tracking-wider bg-amber-50/30 dark:bg-amber-950/10">
                        Próximas do Vencimento ({upcomingCount})
                      </div>
                      {upcomingTransactions.map((tx) => (
                        <div key={tx.id} className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex justify-between items-start text-xs">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{tx.name}</p>
                            <p className="text-slate-500 dark:text-slate-400">
                              Vence em {tx.dueDate.split('-').reverse().join('/')} • R$ {tx.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <button
                            onClick={() => onMarkAsPaid(tx.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-[10px] font-medium transition cursor-pointer"
                          >
                            Pagar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {overdueCount === 0 && upcomingCount === 0 && !isBudgetExceeded && (
                    <div className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                      <CheckCircle2 className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                      <p className="text-xs">Tudo azul! Sem pendências de pagamento ou limites estourados.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account Picker Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowBellDropdown(false);
              }}
              id="profile-picker-btn"
              className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer"
            >
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${activeAccount.avatarColor}`}>
                {activeAccount.name.charAt(0)}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-tight leading-none mb-0.5">
                  {activeAccount.name}
                </p>
                <p className="text-[10px] text-slate-400 font-mono leading-none">
                  Online
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden lg:block" />
            </button>

            {/* User Dropdown */}
            {showUserDropdown && (
              <div 
                id="user-dropdown-list"
                className="absolute right-0 mt-3 w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-2.5 z-50"
              >
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{activeAccount.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{activeAccount.email}</p>
                </div>
                <div className="p-1 px-4 text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-1.5">
                  Trocar de Conta
                </div>
                <div className="space-y-0.5 max-h-40 overflow-y-auto px-1.5">
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => {
                        onSelectAccount(acc.id);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        acc.id === activeAccountId
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 font-medium'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <span className={`h-6 w-6 rounded flex items-center justify-center text-white text-xs font-bold ${acc.avatarColor}`}>
                        {acc.name.charAt(0)}
                      </span>
                      <span className="truncate">{acc.name}</span>
                    </button>
                  ))}
                </div>
                
                <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2 px-3">
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono p-1">
                    <Clock className="h-3 w-3 text-sky-400" />
                    <span>Nuvem Ativada (Simulado)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
