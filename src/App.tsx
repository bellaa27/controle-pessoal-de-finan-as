/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Target, 
  AreaChart, 
  Settings as SettingsIcon,
  Plus,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

import { Transaction, SavingGoal, BudgetLimit, UserAccount, PaymentStatus, AppState } from './types';
import { mockTransactions, mockGoals, mockBudgets, mockUsers } from './mockData';

// Component imports
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import GoalPlanner from './components/GoalPlanner';
import Reports from './components/Reports';
import Settings from './components/Settings';
import TransactionForm from './components/TransactionForm';

export default function App() {
  // Navigation & Month Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'goals' | 'reports' | 'settings'>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-06'); // Default to current month from metadata
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Master State representing ledger datasets
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [budgets, setBudgets] = useState<BudgetLimit[]>([]);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string>('user-1');
  const [monthlyEconomyGoal, setMonthlyEconomyGoal] = useState<number>(1000);

  // Form modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Load from local storage or configure initial mock files
  useEffect(() => {
    try {
      // Theme configuration loading
      const storedTheme = localStorage.getItem('finances_theme') as 'light' | 'dark' | null;
      if (storedTheme) {
        setTheme(storedTheme);
      } else {
        const wantsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(wantsDark ? 'dark' : 'light');
      }

      // Financial datasets loading
      const cachedTxs = localStorage.getItem('finances_txs');
      const cachedGoals = localStorage.getItem('finances_goals');
      const cachedBudgets = localStorage.getItem('finances_budgets');
      const cachedAccounts = localStorage.getItem('finances_accounts');
      const cachedActiveAcc = localStorage.getItem('finances_active_acc');
      const cachedMonthlyGoal = localStorage.getItem('finances_monthly_goal');

      if (cachedTxs) setTransactions(JSON.parse(cachedTxs));
      else setTransactions(mockTransactions);

      if (cachedGoals) setGoals(JSON.parse(cachedGoals));
      else setGoals(mockGoals);

      if (cachedBudgets) setBudgets(JSON.parse(cachedBudgets));
      else setBudgets(mockBudgets);

      if (cachedAccounts) setAccounts(JSON.parse(cachedAccounts));
      else setAccounts(mockUsers);

      if (cachedActiveAcc) setActiveAccountId(cachedActiveAcc);
      else setActiveAccountId('user-1');

      if (cachedMonthlyGoal) setMonthlyEconomyGoal(Number(cachedMonthlyGoal));
      else setMonthlyEconomyGoal(1200);

    } catch (e) {
      console.error("Local storage restoration crash. Loading mock models.", e);
      setTransactions(mockTransactions);
      setGoals(mockGoals);
      setBudgets(mockBudgets);
      setAccounts(mockUsers);
      setActiveAccountId('user-1');
      setMonthlyEconomyGoal(1200);
    }
  }, []);

  // Sync back to local storage whenever datasets update
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('finances_txs', JSON.stringify(transactions));
    }
  }, [transactions]);

  useEffect(() => {
    if (goals.length > 0) {
      localStorage.setItem('finances_goals', JSON.stringify(goals));
    }
  }, [goals]);

  useEffect(() => {
    if (budgets.length > 0) {
      localStorage.setItem('finances_budgets', JSON.stringify(budgets));
    }
  }, [budgets]);

  useEffect(() => {
    if (accounts.length > 0) {
      localStorage.setItem('finances_accounts', JSON.stringify(accounts));
    }
  }, [accounts]);

  useEffect(() => {
    if (activeAccountId) {
      localStorage.setItem('finances_active_acc', activeAccountId);
    }
  }, [activeAccountId]);

  useEffect(() => {
    localStorage.setItem('finances_monthly_goal', String(monthlyEconomyGoal));
  }, [monthlyEconomyGoal]);

  // Handle HTML dark class application whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('finances_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Compile dynamically distinct months in transactions for header picker
  const getMonthsList = () => {
    const months: string[] = Array.from(new Set(transactions.map((t) => t.purchaseDate.substring(0, 7))));
    months.sort((a, b) => b.localeCompare(a)); // Descending order: newest months first
    
    const monthNames: Record<string, string> = {
      '01': 'Janeiro',
      '02': 'Fevereiro',
      '03': 'Março',
      '04': 'Abril',
      '05': 'Maio',
      '06': 'Junho',
      '07': 'Julho',
      '08': 'Agosto',
      '09': 'Setembro',
      '10': 'Outubro',
      '11': 'Novembro',
      '12': 'Dezembro'
    };

    return months.map(m => {
      const parts = m.split('-');
      return {
        value: m,
        label: `${monthNames[parts[1]] || 'Mês'} de ${parts[0]}`
      };
    });
  };

  // Filter transactions according to selected Month (or allow all)
  const getFilteredTransactions = () => {
    if (selectedMonth === 'all') return transactions;
    return transactions.filter(t => t.purchaseDate.startsWith(selectedMonth));
  };

  // Save Transaction (Add / Edit)
  const handleSaveTransaction = (txData: Partial<Transaction> & { id?: string }) => {
    const today = new Date().toISOString().split('T')[0];
    if (txData.id) {
      // Editing existing
      setTransactions(prev => prev.map(t => {
        if (t.id === txData.id) {
          return {
            ...t,
            ...txData,
            paymentDate: txData.status === 'pago' ? (txData.paymentDate || today) : undefined,
            paidMethod: txData.status === 'pago' ? (txData.paidMethod || txData.paymentMethod) : undefined,
            paidBank: txData.status === 'pago' ? (txData.paidBank || txData.bank) : undefined,
          } as Transaction;
        }
        return t;
      }));
    } else {
      // Adding new
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: txData.type || 'gasto',
        name: txData.name || 'Nova Transação',
        category: txData.category || 'Outros',
        value: txData.value || 0,
        purchaseDate: txData.purchaseDate || today,
        dueDate: txData.dueDate || today,
        notes: txData.notes || '',
        paymentMethod: txData.paymentMethod || 'PIX',
        bank: txData.bank || 'Nubank',
        status: txData.status || 'pendente',
        paymentDate: txData.status === 'pago' ? (txData.paymentDate || today) : undefined,
        paidMethod: txData.status === 'pago' ? (txData.paidMethod || txData.paymentMethod) : undefined,
        paidBank: txData.status === 'pago' ? (txData.paidBank || txData.bank) : undefined,
      };
      setTransactions(prev => [newTx, ...prev]);
    }
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Toggle quick pay status
  const handleToggleStatus = (id: string, newStatus: PaymentStatus) => {
    const today = new Date().toISOString().split('T')[0];
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: newStatus,
          paymentDate: newStatus === 'pago' ? today : undefined,
          paidMethod: newStatus === 'pago' ? t.paymentMethod : undefined,
          paidBank: newStatus === 'pago' ? t.bank : undefined,
        };
      }
      return t;
    }));
  };

  // Quick mark paid inside warning notification bar call
  const handleMarkAsPaidQuickly = (id: string) => {
    handleToggleStatus(id, 'pago');
  };

  // Add / Delete Saving Goals
  const handleAddGoal = (goalData: Omit<SavingGoal, 'id'>) => {
    const newGoal: SavingGoal = {
      ...goalData,
      id: `goal-${Date.now()}`
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleModifyGoalProgress = (id: string, amount: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        return {
          ...g,
          currentValue: g.currentValue + amount
        };
      }
      return g;
    }));
  };

  // Profile Switching & Add Accounts
  const handleAddNewAccount = (name: string, email: string) => {
    const colors = [
      'bg-indigo-500', 'bg-sky-500', 'bg-violet-500', 
      'bg-pink-500', 'bg-amber-500', 'bg-rose-500'
    ];
    const newAcc: UserAccount = {
      id: `user-${Date.now()}`,
      name,
      email,
      avatarColor: colors[Math.floor(Math.random() * colors.length)]
    };
    setAccounts(prev => [...prev, newAcc]);
  };

  // Complete clean system reset
  const handleResetDatabase = () => {
    localStorage.removeItem('finances_txs');
    localStorage.removeItem('finances_goals');
    localStorage.removeItem('finances_budgets');
    localStorage.removeItem('finances_accounts');
    localStorage.removeItem('finances_active_acc');
    localStorage.removeItem('finances_monthly_goal');

    // Restore raw defaults
    setTransactions(mockTransactions);
    setGoals(mockGoals);
    setBudgets(mockBudgets);
    setAccounts(mockUsers);
    setActiveAccountId('user-1');
    setMonthlyEconomyGoal(1200);
    setSelectedMonth('2026-06');
    setActiveTab('dashboard');
  };

  // Excel structured JSON exporting
  const handleExportBackup = () => {
    const backupState: Partial<AppState> = {
      transactions,
      goals,
      budgets,
      monthlyEconomyGoal,
    };

    const strJson = JSON.stringify(backupState, null, 2);
    const blob = new Blob([strJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Backup_Financeiro_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Backup file uploading restoration
  const handleImportBackup = (state: Partial<AppState>): string | null => {
    if (!state) return "Backup corrompido.";
    if (state.transactions) setTransactions(state.transactions as Transaction[]);
    if (state.goals) setGoals(state.goals as SavingGoal[]);
    if (state.budgets) setBudgets(state.budgets as BudgetLimit[]);
    if (state.monthlyEconomyGoal) setMonthlyEconomyGoal(state.monthlyEconomyGoal);
    return null;
  };

  // Calculate high-level alert warnings
  const activeMonthTxs = transactions.filter(t => t.purchaseDate.startsWith('2026-06'));
  const activeMonthGastos = activeMonthTxs.filter(t => t.type === 'gasto');
  
  // Checking overdue counts and warning counts (based on reference June 17, 2026)
  const todayDateStr = '2026-06-17';
  const today = new Date(todayDateStr + 'T00:00:00');

  // Overdue transactions
  const overdueTxs = transactions.filter(t => {
    if (t.type !== 'gasto' || t.status !== 'atrasado') return false;
    const due = new Date(t.dueDate + 'T00:00:00');
    return due < today;
  });

  // Upcoming transactions (within 3 days, and is pendente)
  const upcomingTxs = transactions.filter(t => {
    if (t.type !== 'gasto' || t.status !== 'pendente') return false;
    const due = new Date(t.dueDate + 'T00:00:00');
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  });

  // Budget exceeded status
  const categorySpentSums: Record<string, number> = {};
  activeMonthGastos.forEach(g => {
    categorySpentSums[g.category] = (categorySpentSums[g.category] || 0) + g.value;
  });

  const exceededBudgetCategories: string[] = [];
  budgets.forEach(b => {
    const spent = categorySpentSums[b.category] || 0;
    if (spent > b.limitValue) {
      exceededBudgetCategories.push(`${b.category} (R$ ${spent.toFixed(0)} / R$ ${b.limitValue})`);
    }
  });

  const isBudgetExceeded = exceededBudgetCategories.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 font-sans flex flex-col transition-colors duration-300">
      
      {/* Header bar controls */}
      <Header
        accounts={accounts}
        activeAccountId={activeAccountId}
        onSelectAccount={setActiveAccountId}
        selectedMonth={selectedMonth}
        monthsList={getMonthsList()}
        onMonthChange={setSelectedMonth}
        theme={theme}
        toggleTheme={toggleTheme}
        overdueCount={overdueTxs.length}
        upcomingCount={upcomingTxs.length}
        isBudgetExceeded={isBudgetExceeded}
        budgetAlerts={exceededBudgetCategories}
        overdueTransactions={overdueTxs}
        upcomingTransactions={upcomingTxs}
        onMarkAsPaid={handleMarkAsPaidQuickly}
      />

      {/* Main Multi-Tab workspace layout containing dynamic layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        
        {/* Left Hand layout Desktop Sidebar Navigation links */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col text-xs font-semibold gap-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-3.5 rounded-2xl space-y-1">
            <span className="block text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">Painéis e Lançamentos</span>
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span>📊 Dashboard Analítico</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === 'transactions'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <ArrowRightLeft className="h-4.5 w-4.5" />
              <span>💸 Livro de Transações</span>
            </button>

            <button
              onClick={() => setActiveTab('goals')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === 'goals'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Target className="h-4.5 w-4.5" />
              <span>🎯 Economias e Metas</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <AreaChart className="h-4.5 w-4.5" />
              <span>📈 Relatórios & PDF</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <SettingsIcon className="h-4.5 w-4.5" />
              <span>⚙️ Configurações & Backup</span>
            </button>
          </div>

          {/* Quick Create CTA in sidebar */}
          <div className="bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl p-4 space-y-3 mt-4 hidden md:block">
            <h5 className="font-semibold text-slate-800 dark:text-slate-200">Precisa lançar algo?</h5>
            <p className="text-[10px] text-slate-500 text-slate-450 leading-relaxed font-normal">
              Registre na hora suas contas a pagar, pix ou rendimentos extras recebidos.
            </p>
            <button
              onClick={() => {
                setEditingTransaction(null);
                setIsFormOpen(true);
              }}
              className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-[11px] shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1 cursor-pointer animate-press"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Lançamento</span>
            </button>
          </div>
        </aside>

        {/* Dynamic Inner Tab Stage Area */}
        <main className="flex-1 min-w-0">
          
          {/* Active Title Indicator */}
          <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white uppercase tracking-wider">
                {activeTab === 'dashboard' && '📊 Dashboard Geral'}
                {activeTab === 'transactions' && '💸 Registro de Lançamentos'}
                {activeTab === 'goals' && '🎯 Planejamento e Poupanças'}
                {activeTab === 'reports' && '📈 Análise e Extratos Completos'}
                {activeTab === 'settings' && '⚙️ Painel de Utilitários'}
              </h2>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Lançamentos exibidos: <b className="font-mono">{selectedMonth === 'all' ? 'Histórico Geral' : `${selectedMonth.split('-')[1]}/${selectedMonth.split('-')[0]}`}</b>
              </span>
            </div>

            {/* Quick-Action floating button on tablets / mobiles */}
            <div className="md:hidden">
              <button
                onClick={() => {
                  setEditingTransaction(null);
                  setIsFormOpen(true);
                }}
                className="bg-indigo-600 text-white p-2.5 rounded-full shadow-lg cursor-pointer"
                title="Lançamento Rápido"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Render Active Panels */}
          {activeTab === 'dashboard' && (
            <Dashboard
              transactions={getFilteredTransactions()}
              budgets={budgets}
              monthlyEconomyGoal={monthlyEconomyGoal}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionList
              transactions={getFilteredTransactions()}
              onEdit={(tx) => {
                setEditingTransaction(tx);
                setIsFormOpen(true);
              }}
              onDelete={handleDeleteTransaction}
              onAddNew={() => {
                setEditingTransaction(null);
                setIsFormOpen(true);
              }}
              onToggleStatus={handleToggleStatus}
            />
          )}

          {activeTab === 'goals' && (
            <GoalPlanner
              goals={goals}
              transactions={transactions}
              budgets={budgets}
              onAddGoal={handleAddGoal}
              onDeleteGoal={handleDeleteGoal}
              onModifyGoalProgress={handleModifyGoalProgress}
              monthlyEconomyGoal={monthlyEconomyGoal}
              onUpdateMonthlyEconomyGoal={setMonthlyEconomyGoal}
            />
          )}

          {activeTab === 'reports' && (
            <Reports
              transactions={getFilteredTransactions()}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              accounts={accounts}
              activeAccountId={activeAccountId}
              onAddNewAccount={handleAddNewAccount}
              theme={theme}
              onToggleTheme={toggleTheme}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              onResetDatabase={handleResetDatabase}
            />
          )}

        </main>

      </div>

      {/* Conditional Form Overlay Modals */}
      {isFormOpen && (
        <TransactionForm
          transaction={editingTransaction}
          onSave={handleSaveTransaction}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTransaction(null);
          }}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-100 bg-white dark:border-slate-900 dark:bg-slate-900/40 text-center py-4 font-mono text-[10px] text-slate-400">
        <p>© 2026 Controle Financeiro Mensal • Todos os direitos reservados</p>
      </footer>

    </div>
  );
}
