/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction, SavingGoal, BudgetLimit, UserAccount } from './types';

export const mockUsers: UserAccount[] = [
  {
    id: 'user-1',
    name: 'Isabella Cardoso',
    email: 'bella.cardoso.santos0704@gmail.com',
    avatarColor: 'bg-emerald-500'
  }
];

export const mockGoals: SavingGoal[] = [
  {
    id: 'goal-1',
    name: 'Reserva de Emergência',
    targetValue: 12000,
    currentValue: 4800,
    deadline: '2026-12-31',
    notes: 'Guardar pelo menos R$ 500 por mês no fundo de renda fixa.'
  },
  {
    id: 'goal-2',
    name: 'Viagem de Fim de Ano',
    targetValue: 5000,
    currentValue: 1850,
    deadline: '2026-11-30',
    notes: 'Passagens e hospedagem na praia.'
  },
  {
    id: 'goal-3',
    name: 'Troca de Notebook',
    targetValue: 6000,
    currentValue: 4000,
    deadline: '2026-09-15',
    notes: 'Comprar modelo com melhor desempenho para trabalho.'
  }
];

export const mockBudgets: BudgetLimit[] = [
  { category: 'Alimentação', limitValue: 1200 },
  { category: 'Transporte', limitValue: 500 },
  { category: 'Lazer', limitValue: 600 },
  { category: 'Moradia', limitValue: 2200 },
  { category: 'Educação', limitValue: 800 },
  { category: 'Saúde', limitValue: 400 },
  { category: 'Outros', limitValue: 300 }
];

export const mockTransactions: Transaction[] = [
  // --- MAIO 2026 ---
  {
    id: 'tx-m-1',
    type: 'receita',
    name: 'Salário Mensal',
    category: 'Salário',
    value: 5500,
    purchaseDate: '2026-05-05',
    dueDate: '2026-05-05',
    paymentMethod: 'Transferência Bancária',
    bank: 'Nubank',
    status: 'pago',
    paymentDate: '2026-05-05',
    notes: 'Salário regular da CLT'
  },
  {
    id: 'tx-m-2',
    type: 'receita',
    name: 'Projeto Freelance UX',
    category: 'Freelance',
    value: 1100,
    purchaseDate: '2026-05-15',
    dueDate: '2026-05-15',
    paymentMethod: 'PIX',
    bank: 'Inter',
    status: 'pago',
    paymentDate: '2026-05-15'
  },
  {
    id: 'tx-m-3',
    type: 'gasto',
    name: 'Aluguel do Apartamento',
    category: 'Moradia',
    value: 1800,
    purchaseDate: '2026-05-01',
    dueDate: '2026-05-10',
    paymentMethod: 'Boleto',
    bank: 'Caixa',
    status: 'pago',
    paymentDate: '2026-05-09'
  },
  {
    id: 'tx-m-4',
    type: 'gasto',
    name: 'Supermercado Central',
    category: 'Alimentação',
    value: 850.40,
    purchaseDate: '2026-05-08',
    dueDate: '2026-05-25',
    paymentMethod: 'Cartão de Crédito',
    bank: 'Nubank',
    status: 'pago',
    paymentDate: '2026-05-20'
  },
  {
    id: 'tx-m-5',
    type: 'gasto',
    name: 'Mensalidade Faculdade',
    category: 'Educação',
    value: 450,
    purchaseDate: '2026-05-01',
    dueDate: '2026-05-15',
    paymentMethod: 'Boleto',
    bank: 'Banco do Brasil',
    status: 'pago',
    paymentDate: '2026-05-13'
  },
  {
    id: 'tx-m-6',
    type: 'gasto',
    name: 'Cinema e Jantar Fim de Semana',
    category: 'Lazer',
    value: 185.90,
    purchaseDate: '2026-05-16',
    dueDate: '2026-05-16',
    paymentMethod: 'Cartão de Débito',
    bank: 'Itaú',
    status: 'pago',
    paymentDate: '2026-05-16'
  },
  {
    id: 'tx-m-7',
    type: 'gasto',
    name: 'Combustível Posto Ipiranga',
    category: 'Transporte',
    value: 220,
    purchaseDate: '2026-05-20',
    dueDate: '2026-05-25',
    paymentMethod: 'Cartão de Crédito',
    bank: 'Bradesco',
    status: 'pago',
    paymentDate: '2026-05-24'
  },
  {
    id: 'tx-m-8',
    type: 'gasto',
    name: 'Exames de Rotina',
    category: 'Saúde',
    value: 120,
    purchaseDate: '2026-05-12',
    dueDate: '2026-05-12',
    paymentMethod: 'PIX',
    bank: 'Nubank',
    status: 'pago',
    paymentDate: '2026-05-12'
  },
  {
    id: 'tx-m-9',
    type: 'gasto',
    name: 'Assinatura Streaming',
    category: 'Lazer',
    value: 55.90,
    purchaseDate: '2026-05-28',
    dueDate: '2026-05-28',
    paymentMethod: 'Cartão de Crédito',
    bank: 'Nubank',
    status: 'pago',
    paymentDate: '2026-05-28'
  },

  // --- JUNHO 2026 (Mês Atual - Data Atual: 17 de Junho de 2026) ---
  {
    id: 'tx-j-1',
    type: 'receita',
    name: 'Salário Clt',
    category: 'Salário',
    value: 5500,
    purchaseDate: '2026-06-05',
    dueDate: '2026-06-05',
    paymentMethod: 'Transferência Bancária',
    bank: 'Nubank',
    status: 'pago',
    paymentDate: '2026-06-05',
    notes: 'Salário mensal recebido integralmente'
  },
  {
    id: 'tx-j-2',
    type: 'receita',
    name: 'Projeto Website Freelance',
    category: 'Freelance',
    value: 1400,
    purchaseDate: '2026-06-12',
    dueDate: '2026-06-12',
    paymentMethod: 'PIX',
    bank: 'Inter',
    status: 'pago',
    paymentDate: '2026-06-12',
    notes: 'Desenvolvimento de Landing Page institucional'
  },
  {
    id: 'tx-j-3',
    type: 'gasto',
    name: 'Aluguel do Apartamento',
    category: 'Moradia',
    value: 1800,
    purchaseDate: '2026-06-01',
    dueDate: '2026-06-10',
    paymentMethod: 'Boleto',
    bank: 'Caixa',
    status: 'pago',
    paymentDate: '2026-06-08',
    notes: 'Aluguel fixo com condomínio incluso'
  },
  {
    id: 'tx-j-4',
    type: 'gasto',
    name: 'Mensalidade Faculdade',
    category: 'Educação',
    value: 450,
    purchaseDate: '2026-06-01',
    dueDate: '2026-06-15', // ATRASADO! Hoje é 17 de junho
    paymentMethod: 'Boleto',
    bank: 'Banco do Brasil',
    status: 'atrasado',
    notes: 'Precisa emitir segunda via com juros'
  },
  {
    id: 'tx-j-5',
    type: 'gasto',
    name: 'Conta de Energia (Enel)',
    category: 'Moradia',
    value: 189.60,
    purchaseDate: '2026-06-02',
    dueDate: '2026-06-18', // PRÓXIMO DO VENCIMENTO! Amanhã!
    paymentMethod: 'PIX',
    bank: 'Itaú',
    status: 'pendente',
    notes: 'Código de barras recebido por e-mail'
  },
  {
    id: 'tx-j-6',
    type: 'gasto',
    name: 'Supermercado Mensal',
    category: 'Alimentação',
    value: 945.30,
    purchaseDate: '2026-06-06',
    dueDate: '2026-06-25', // Pendente, mas com saldo garantido
    paymentMethod: 'Cartão de Crédito',
    bank: 'Nubank',
    status: 'pago',
    paymentDate: '2026-06-06',
    notes: 'Abastecimento da casa para o mês'
  },
  {
    id: 'tx-j-7',
    type: 'gasto',
    name: 'Jantar Pizzaria Gourmet',
    category: 'Lazer',
    value: 145,
    purchaseDate: '2026-06-12',
    dueDate: '2026-06-12',
    paymentMethod: 'Cartão de Crédito',
    bank: 'Nubank',
    status: 'pago',
    paymentDate: '2026-06-12',
    notes: 'Comemoração de aniversário'
  },
  {
    id: 'tx-j-8',
    type: 'gasto',
    name: 'Combustível Carro',
    category: 'Transporte',
    value: 180,
    purchaseDate: '2026-06-10',
    dueDate: '2026-06-15',
    paymentMethod: 'Cartão de Débito',
    bank: 'Bradesco',
    status: 'pago',
    paymentDate: '2026-06-10'
  },
  {
    id: 'tx-j-9',
    type: 'gasto',
    name: 'Internet Banda Larga',
    category: 'Moradia',
    value: 119.90,
    purchaseDate: '2026-06-05',
    dueDate: '2026-06-22', // Pendente, faltam 5 dias
    paymentMethod: 'Boleto',
    bank: 'Nubank',
    status: 'pendente',
    notes: 'Débito automático não cadastrado'
  },
  {
    id: 'tx-j-10',
    type: 'gasto',
    name: 'Consulta Dentista',
    category: 'Saúde',
    value: 250,
    purchaseDate: '2026-06-15',
    dueDate: '2026-06-15',
    paymentMethod: 'PIX',
    bank: 'Inter',
    status: 'pago',
    paymentDate: '2026-06-15',
    notes: 'Tratamento de canal'
  },
  {
    id: 'tx-j-11',
    type: 'gasto',
    name: 'Aparelhos Livros Acadêmicos',
    category: 'Educação',
    value: 120,
    purchaseDate: '2026-06-16',
    dueDate: '2026-06-30',
    paymentMethod: 'Cartão de Crédito',
    bank: 'Santander',
    status: 'pendente',
    notes: 'Comprado na Amazon'
  }
];
