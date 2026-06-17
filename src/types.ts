/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = 'gasto' | 'receita';

export type ExpenseCategory = 
  | 'Alimentação' 
  | 'Transporte' 
  | 'Educação' 
  | 'Lazer' 
  | 'Saúde' 
  | 'Moradia' 
  | 'Outros';

export type RevenueCategory = 
  | 'Salário' 
  | 'Freelance' 
  | 'Investimentos' 
  | 'Reembolso' 
  | 'Outros';

export type PaymentMethod = 
  | 'Dinheiro' 
  | 'PIX' 
  | 'Cartão de Débito' 
  | 'Cartão de Crédito' 
  | 'Boleto' 
  | 'Transferência Bancária';

export type BankInstitution = 
  | 'Nubank' 
  | 'Banco do Brasil' 
  | 'Caixa' 
  | 'Itaú' 
  | 'Bradesco' 
  | 'Santander' 
  | 'Inter' 
  | 'Sicredi' 
  | 'Cooperativas' 
  | 'Outros';

export type PaymentStatus = 'pago' | 'pendente' | 'atrasado';

export interface Transaction {
  id: string;
  type: TransactionType;
  name: string;
  category: ExpenseCategory | RevenueCategory;
  value: number;
  purchaseDate: string; // YYYY-MM-DD
  dueDate: string;      // YYYY-MM-DD
  notes?: string;
  
  // Payment info
  paymentMethod: PaymentMethod;
  bank: BankInstitution;
  status: PaymentStatus;
  
  // Realized payment log (when user marks as pago)
  paymentDate?: string; // YYYY-MM-DD
  paidMethod?: PaymentMethod;
  paidBank?: BankInstitution;
}

export interface SavingGoal {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
  deadline: string; // YYYY-MM-DD
  notes?: string;
}

export interface BudgetLimit {
  category: ExpenseCategory;
  limitValue: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
}

export interface AppState {
  transactions: Transaction[];
  goals: SavingGoal[];
  budgets: BudgetLimit[];
  monthlyEconomyGoal: number; // General dynamic saving goal
  accounts: UserAccount[];
  activeAccountId: string;
}
