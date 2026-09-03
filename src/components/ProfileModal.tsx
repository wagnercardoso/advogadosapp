import React, { useState, useRef } from 'react';
import { LawyerProfile, SecuritySettings, LegalSpecialty } from '../types';
import { hashSecurityPin, StorageService } from '../services/storage';
import { User, Scale, ShieldCheck, KeyRound, Download, Upload, Sparkles, X, Check, AlertCircle } from 'lucide-react';

interface ProfileModalProps {
  profile: LawyerProfile;
  securitySettings?: SecuritySettings;
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: LawyerProfile) => void;
  onSaveSecurity?: (settings: SecuritySettings) => void;
  onRefreshData?: () => void;
}

const SPECIALTIES: LegalSpecialty[] = [
  'Direito Cível',
  'Direito Penal / Criminalista',
  'Direito do Trabalho',
  'Direito de Família e Sucessões',
  'Direito do Consumidor',
  'Direito Tributário',
  'Direito Previdenciário',
  'Direito Empresarial',
  'Direito Imobiliário',
  'Direito Administrativo / Público',
  'Geral',
  'Outra Especialidade',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  securitySettings,
  isOpen,
  onClose,
  onSaveProfile,
  onSaveSecurity,
  onRefreshData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'security' | 'backup' | 'ai'>('profile');

  // Profile Form States
  const [name, setName] = useState(profile.name || '');
  const [specialty, setSpecialty] = useState(profile.specialty || 'Direito Cível');
  const [oabNumber, setOabNumber] = useState(profile.oabNumber || '');
  const [oabState, setOabState] = useState(profile.oabState || 'SP');
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [customGeminiApiKey, setCustomGeminiApiKey] = useState(profile.customGeminiApiKey || '');

  // Security Form States
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [autoLockMinutes, setAutoLockMinutes] = useState(securitySettings?.autoLockMinutes ?? 15);
  const [securityStatusMsg, setSecurityStatusMsg] = useState('');

  // Backup file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupMsg, setBackupMsg] = useState('');

  if (!isOpen) return null;

  const handleSaveProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: LawyerProfile = {
      ...profile,
      name: name.trim(),
      specialty,
      oabNumber: oabNumber.trim() || undefined,
      oabState: oabState.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      customGeminiApiKey: customGeminiApiKey.trim() || undefined,
    };
    StorageService.saveProfile(updated);
    onSaveProfile(updated);
    onClose();
  };

  const handleUpdatePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityStatusMsg('');

    if (!newPin || newPin.length < 4) {
      setSecurityStatusMsg('O novo PIN deve conter no mínimo 4 dígitos.');
      return;
    }

    if (newPin !== confirmPin) {
      setSecurityStatusMsg('A confirmação do PIN não confere.');
      return;
    }

    try {
      const pinHash = await hashSecurityPin(newPin);
      const updatedSec: SecuritySettings = {
        ...(securitySettings || { rememberDevice: true }),
        isConfigured: true,
        pinHash,
        autoLockMinutes,
      };

      StorageService.saveSecurity(updatedSec);
      if (onSaveSecurity) onSaveSecurity(updatedSec);
      setNewPin('');
      setConfirmPin('');
      setSecurityStatusMsg('PIN de acesso atualizado com sucesso!');
    } catch (err: any) {
      setSecurityStatusMsg('Erro ao atualizar PIN: ' + err.message);
    }
  };

  // Export local backup file
  const handleExportBackup = () => {
    const backupJson = StorageService.exportFullBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tec_justica_lite_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setBackupMsg('Backup exportado com sucesso! Guarde este arquivo em local seguro.');
  };

  // Import local backup file
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = StorageService.importFullBackup(content);
      if (res.success) {
        setBackupMsg(`Sucesso! ${res.count?.cases ?? 0} causas e ${res.count?.tasks ?? 0} tarefas restauradas.`);
        if (onRefreshData) onRefreshData();
      } else {
        setBackupMsg(`Falha ao restaurar: ${res.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0a0a0a] border border-[#C5A059]/40 w-full max-w-xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="bg-[#0f0f0f] px-5 py-4 border-b border-[#C5A059]/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-sm bg-[#111111] border border-[#C5A059]/40 text-[#C5A059]">
              <User size={18} />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-white font-['Cinzel',serif] tracking-wider uppercase">
                Perfil & Configurações do Escritório
              </h3>
              <p className="text-[11px] text-white/50">
                Personalização de respostas de IA, segurança e backup dos dados.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-sm transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex border-b border-white/10 text-xs bg-[#080808]">
          <button
            type="button"
            onClick={() => setActiveSubTab('profile')}
            className={`flex-1 py-2.5 px-3 text-center uppercase tracking-wider font-medium text-[11px] transition-colors ${
              activeSubTab === 'profile'
                ? 'text-[#C5A059] border-b-2 border-[#C5A059] bg-white/5'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Advogado(a)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('security')}
            className={`flex-1 py-2.5 px-3 text-center uppercase tracking-wider font-medium text-[11px] transition-colors ${
              activeSubTab === 'security'
                ? 'text-[#C5A059] border-b-2 border-[#C5A059] bg-white/5'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Segurança & PIN
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('backup')}
            className={`flex-1 py-2.5 px-3 text-center uppercase tracking-wider font-medium text-[11px] transition-colors ${
              activeSubTab === 'backup'
                ? 'text-[#C5A059] border-b-2 border-[#C5A059] bg-white/5'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Backup Local
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('ai')}
            className={`flex-1 py-2.5 px-3 text-center uppercase tracking-wider font-medium text-[11px] transition-colors ${
              activeSubTab === 'ai'
                ? 'text-[#C5A059] border-b-2 border-[#C5A059] bg-white/5'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Opções de IA
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: Profile Details */}
          {activeSubTab === 'profile' && (
            <form onSubmit={handleSaveProfileSubmit} className="space-y-4">
              <div className="bg-[#050505] p-3 rounded-sm border border-white/10 text-white/70 leading-relaxed text-[11px]">
                Seu nome e especialidade são utilizados para calibrar a fundamentação jurídica e personalizar as respostas da Inteligência Artificial.
              </div>

              <div>
                <label className="block text-white/70 font-medium mb-1 uppercase tracking-wider text-[10px]">
                  Nome Completo / Dr(a). <span className="text-[#C5A059]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dr. Wagner Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-sm px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-white/70 font-medium mb-1 uppercase tracking-wider text-[10px]">
                  Área / Especialidade Jurídica Principal <span className="text-[#C5A059]">*</span>
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                >
                  {SPECIALTIES.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-white/70 font-medium mb-1 uppercase tracking-wider text-[10px]">
                    Número de Inscrição na OAB
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 123.456"
                    value={oabNumber}
                    onChange={(e) => setOabNumber(e.target.value)}
                    className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-medium mb-1 uppercase tracking-wider text-[10px]">
                    UF da OAB
                  </label>
                  <input
                    type="text"
                    placeholder="SP, RJ..."
                    maxLength={2}
                    value={oabState}
                    onChange={(e) => setOabState(e.target.value.toUpperCase())}
                    className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059] uppercase font-mono text-center"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 uppercase text-xs tracking-wider transition-colors"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] hover:bg-[#D4B069] text-black font-bold uppercase text-xs tracking-widest transition-all shadow-sm"
                >
                  Salvar Perfil
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Security & PIN Management */}
          {activeSubTab === 'security' && (
            <form onSubmit={handleUpdatePinSubmit} className="space-y-4">
              <div className="bg-[#050505] p-3 rounded-sm border border-[#C5A059]/30 text-white/70 text-[11px] space-y-1">
                <p className="text-[#C5A059] font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck size={13} /> Bloqueio Seguro & Criptografia Local
                </p>
                <p>
                  Defina um novo PIN de acesso para proteger a visualização dos dados confidenciais quando o aplicativo for bloqueado.
                </p>
              </div>

              {securityStatusMsg && (
                <div className="p-3 bg-white/5 border border-[#C5A059]/40 rounded-sm text-xs text-[#C5A059]">
                  {securityStatusMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 font-medium mb-1 uppercase tracking-wider text-[10px]">
                    Novo PIN (4 a 8 dígitos)
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={8}
                    placeholder="••••"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-center text-sm font-mono tracking-widest text-[#C5A059] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-medium mb-1 uppercase tracking-wider text-[10px]">
                    Confirmar Novo PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={8}
                    placeholder="••••"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-center text-sm font-mono tracking-widest text-[#C5A059] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 font-medium mb-1 uppercase tracking-wider text-[10px]">
                  Bloqueio Automático por Inatividade
                </label>
                <select
                  value={autoLockMinutes}
                  onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
                  className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                >
                  <option value={0}>Nunca bloquear automaticamente</option>
                  <option value={5}>Após 5 minutos de inatividade</option>
                  <option value={15}>Após 15 minutos de inatividade</option>
                  <option value={30}>Após 30 minutos de inatividade</option>
                  <option value={60}>Após 1 hora</option>
                </select>
              </div>

              <div className="flex justify-end pt-2 border-t border-white/10">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] hover:bg-[#D4B069] text-black font-bold uppercase text-xs tracking-widest transition-all"
                >
                  Atualizar Segurança
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Local Backup & Restore */}
          {activeSubTab === 'backup' && (
            <div className="space-y-4">
              <div className="bg-[#050505] p-3.5 rounded-sm border border-white/10 space-y-2 text-white/70 text-[11px]">
                <p className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-1.5 text-[#C5A059]">
                  <span>💾</span> Armazenamento 100% no seu Dispositivo (Offline)
                </p>
                <p className="leading-relaxed">
                  Todos os seus clientes, causas e tarefas ficam salvos diretamente na memória do seu celular ou computador, economizando internet e bateria. Você pode exportar uma cópia de segurança a qualquer momento.
                </p>
              </div>

              {backupMsg && (
                <div className="p-3 bg-white/5 border border-[#C5A059]/40 rounded-sm text-xs text-white/90">
                  {backupMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Export Card */}
                <div className="bg-[#111111] p-4 rounded-sm border border-white/10 space-y-3 text-center">
                  <Download size={20} className="mx-auto text-[#C5A059]" />
                  <div>
                    <h5 className="font-bold text-white text-xs uppercase tracking-wider">Exportar Backup</h5>
                    <p className="text-[10px] text-white/50 mt-0.5">Baixar arquivo JSON com todos os dados</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="w-full py-2 bg-[#C5A059] hover:bg-[#D4B069] text-black font-bold text-[11px] uppercase tracking-wider transition-all"
                  >
                    Baixar Backup
                  </button>
                </div>

                {/* Import Card */}
                <div className="bg-[#111111] p-4 rounded-sm border border-white/10 space-y-3 text-center">
                  <Upload size={20} className="mx-auto text-white/60" />
                  <div>
                    <h5 className="font-bold text-white text-xs uppercase tracking-wider">Restaurar Backup</h5>
                    <p className="text-[10px] text-white/50 mt-0.5">Importar arquivo de dados salvo</p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 bg-white/10 hover:bg-white/15 text-white font-bold text-[11px] uppercase tracking-wider transition-all"
                  >
                    Selecionar Arquivo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Optional Gemini AI Settings */}
          {activeSubTab === 'ai' && (
            <div className="space-y-4">
              <div className="bg-[#050505] p-3.5 rounded-sm border border-[#C5A059]/40 space-y-2 text-white/70 text-[11px]">
                <p className="text-[#C5A059] font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Sparkles size={14} /> Motor de Inteligência Jurídica Integrado
                </p>
                <p className="leading-relaxed">
                  O aplicativo <strong className="text-white">já funciona perfeitamente sem nenhuma chave obrigatória</strong>, através do seu motor jurídico brasileiro integrado especializado em todas as áreas do direito.
                </p>
                <p className="text-white/50 leading-relaxed">
                  Caso deseje utilizar sua própria cota gratuita da API Gemini do Google AI Studio para consultas em nuvem, você pode informá-la abaixo (opcional).
                </p>
              </div>

              <div>
                <label className="block text-white/70 font-medium mb-1 uppercase tracking-wider text-[10px]">
                  Chave de API Gemini / Google AI Studio (Opcional)
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy... (Opcional - deixe em branco para usar o motor integrado)"
                  value={customGeminiApiKey}
                  onChange={(e) => setCustomGeminiApiKey(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-sm px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059] font-mono"
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleSaveProfileSubmit}
                  className="px-5 py-2 bg-[#C5A059] hover:bg-[#D4B069] text-black font-bold uppercase text-xs tracking-widest transition-all"
                >
                  Salvar Preferências
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
