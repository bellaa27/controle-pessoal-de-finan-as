/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Sun, 
  Moon, 
  Download, 
  Upload, 
  Trash2, 
  UserPlus, 
  RefreshCw, 
  Check, 
  HelpCircle,
  Database,
  CloudLightning,
  Smartphone
} from 'lucide-react';
import { UserAccount, AppState } from '../types';

interface SettingsProps {
  accounts: UserAccount[];
  activeAccountId: string;
  onAddNewAccount: (name: string, email: string) => void;
  // Theme settings
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  // Backup / Data tools
  onExportBackup: () => void;
  onImportBackup: (importedState: Partial<AppState>) => string | null; // returns error message or null
  onResetDatabase: () => void;
}

export default function Settings({
  accounts,
  activeAccountId,
  onAddNewAccount,
  theme,
  onToggleTheme,
  onExportBackup,
  onImportBackup,
  onResetDatabase,
}: SettingsProps) {
  // New account creation states
  const [newAccName, setNewAccName] = useState('');
  const [newAccEmail, setNewAccEmail] = useState('');
  const [showAccForm, setShowAccForm] = useState(false);
  const [accSuccess, setAccSuccess] = useState(false);

  // Import states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim() || !newAccEmail.trim()) return;

    onAddNewAccount(newAccName, newAccEmail);
    setNewAccName('');
    setNewAccEmail('');
    setShowAccForm(false);
    setAccSuccess(true);
    setTimeout(() => setAccSuccess(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && (json.transactions || json.goals)) {
          const err = onImportBackup(json);
          if (err) {
            setImportError(err);
            setImportSuccess(false);
          } else {
            setImportError(null);
            setImportSuccess(true);
            setTimeout(() => setImportSuccess(false), 3000);
          }
        } else {
          setImportError("Formato de backup inválido.");
        }
      } catch (err) {
        setImportError("Erro ao ler ou processar o arquivo de backup.");
      }
    };
    reader.readAsText(file);
    // Clear value to allow re-upload
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div id="settings-tab-content" className="space-y-6">

      {/* Grid: Theme & DB tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Theme and Preferences */}
        <div className="rounded-2xl border border-slate-150 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">Aparência do Aplicativo</h4>
            <p className="text-[10px] text-slate-400">Personalize o tema de cores do seu supervisor financeiro</p>
          </div>

          <div className="flex items-center justify-between py-2 text-xs">
            <span className="font-medium text-slate-705 dark:text-slate-300">Escolha o Tema Visual:</span>
            <button
              onClick={onToggleTheme}
              className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 rounded-xl font-sans font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-4 w-4 text-indigo-500" />
                  <span>Mudar para Escuro</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 text-indigo-500" />
                  <span>Mudar para Claro</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-lg text-[11px] text-slate-400 font-mono">
            O aplicativo sincronizará automaticamente todas as configurações com as preferências de cor do navegador caso correspondam.
          </div>
        </div>

        {/* Database backup restoration */}
        <div className="rounded-2xl border border-slate-150 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <Database className="h-4.5 w-4.5 text-indigo-500" />
              Backup em Nuvem e Arquivamento Local
            </h4>
            <p className="text-[10px] text-slate-400">Resguarde e restaure suas planilhas de finanças em qualquer dispositivo</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Export */}
            <button
              onClick={onExportBackup}
              className="flex-1 text-xs font-semibold px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-800 dark:hover:bg-slate-750 rounded-xl flex items-center justify-center gap-1.5 transition text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <Download className="h-4 w-4 text-blue-500" />
              <span>Baixar Backup (.json)</span>
            </button>

            {/* Import Trigger */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 text-xs font-semibold px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-800 dark:hover:bg-slate-750 rounded-xl flex items-center justify-center gap-1.5 transition text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <Upload className="h-4 w-4 text-indigo-500" />
              <span>Importar Backup</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>

          {/* Messages */}
          {importError && (
            <div className="p-2.5 rounded bg-rose-50 text-rose-700 text-xs text-center border border-rose-200">
              {importError}
            </div>
          )}
          {importSuccess && (
            <div className="p-2.5 rounded bg-emerald-50 text-emerald-700 text-xs text-center border border-emerald-200 flex items-center justify-center gap-1">
              <Check className="h-4 w-4" /> Backup restaurado com sucesso!
            </div>
          )}
        </div>

      </div>

      {/* User Profiles switcher registry */}
      <div className="rounded-2xl border border-slate-150 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">Usuários e Perfis Financeiros</h4>
            <p className="text-[10px] text-slate-400">Configure múltiplos perfis (familiar, profissional ou secundário)</p>
          </div>

          <button
            onClick={() => setShowAccForm(!showAccForm)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" /> Adicionar Perfil
          </button>
        </div>

        {/* Acc Creation Form */}
        {showAccForm && (
          <form onSubmit={handleCreateAccount} className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-3 max-w-md animate-fade-in">
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-250">Cadastrar Novo Usuário</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-0.5">Nome do Perfil *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do integrante"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-0.5">E-mail *</label>
                <input
                  type="email"
                  required
                  placeholder="email@dominio.com"
                  value={newAccEmail}
                  onChange={(e) => setNewAccEmail(e.target.value)}
                  className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 text-[11px] pt-1.5">
              <button
                type="button"
                onClick={() => setShowAccForm(false)}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold cursor-pointer"
              >
                Salvar Perfil
              </button>
            </div>
          </form>
        )}

        {accSuccess && (
          <div className="p-2.5 rounded bg-emerald-50 text-emerald-700 text-xs text-center border border-emerald-250 flex items-center justify-center gap-1">
            <Check className="h-4 w-4" /> Perfil cadastrado! Agora você pode alternar contas no cabeçalho.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {accounts.map((acc) => {
            const isActive = acc.id === activeAccountId;
            return (
              <div 
                key={acc.id} 
                className={`p-3.5 border rounded-xl flex items-center space-x-3 transition-colors ${
                  isActive 
                    ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20' 
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50'
                }`}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 ${acc.avatarColor}`}>
                  {acc.name.charAt(0)}
                </div>
                <div className="truncate min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-850 dark:text-slate-100 truncate leading-tight">{acc.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate leading-none mt-1">{acc.email}</p>
                </div>
                {isActive && (
                  <span className="text-[9px] font-mono font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded shrink-0 uppercase tracking-tight">Ativo</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Extreme Reset Database Panel */}
      <div className="rounded-2xl border border-rose-150 bg-rose-50/30 p-5 dark:border-rose-950/20 dark:bg-rose-950/5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-0.5">
            <h4 className="font-display font-semibold text-xs text-rose-800 dark:text-rose-400 uppercase tracking-widest">Procedimento Destrutivo</h4>
            <p className="text-[11px] text-slate-450 dark:text-slate-400">
              Isso apagará permanentemente todos os lançamentos inseridos, metas de economia e redefinirá o banco de dados para os valores padrão de simulação.
            </p>
          </div>

          <button
            onClick={onResetDatabase}
            className="text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 px-4 py-2 rounded-xl transition shadow cursor-pointer animate-press"
          >
            Resetar Todos os Dados
          </button>
        </div>
      </div>

    </div>
  );
}
