import React, { useState } from 'react';
import { JusticeLogo } from './JusticeLogo';
import { SecuritySettings, LawyerProfile } from '../types';
import { hashSecurityPin, StorageService } from '../services/storage';
import { ShieldCheck, Lock, KeyRound, Check, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AuthLockModalProps {
  isOpen: boolean;
  securitySettings: SecuritySettings;
  profile: LawyerProfile;
  onUnlockSuccess: (token: string) => void;
  onSaveProfile: (profile: LawyerProfile) => void;
  onSaveSecurity: (settings: SecuritySettings) => void;
}

export const AuthLockModal: React.FC<AuthLockModalProps> = ({
  isOpen,
  securitySettings,
  profile,
  onUnlockSuccess,
  onSaveProfile,
  onSaveSecurity,
}) => {
  const isFirstTime = !securitySettings.isConfigured;

  // First-time setup states
  const [setupName, setSetupName] = useState(profile.name || '');
  const [setupSpecialty, setSetupSpecialty] = useState(profile.specialty || 'Direito Cível');
  const [setupPin, setSetupPin] = useState('');
  const [setupPinConfirm, setSetupPinConfirm] = useState('');
  const [setupRemember, setSetupRemember] = useState(true);

  // Unlock states
  const [unlockPin, setUnlockPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  if (!isOpen) return null;

  // Handle Initial Security Setup
  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!setupPin || setupPin.length < 4) {
      setErrorMessage('O PIN / Senha deve conter no mínimo 4 dígitos ou caracteres.');
      return;
    }

    if (setupPin !== setupPinConfirm) {
      setErrorMessage('Os PINs informados não coincidem. Verifique a confirmação.');
      return;
    }

    setIsLoading(true);
    try {
      const pinHash = await hashSecurityPin(setupPin);
      const sessionToken = 'pass_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

      const newSecurity: SecuritySettings = {
        isConfigured: true,
        pinHash,
        autoLockMinutes: 15,
        rememberDevice: setupRemember,
        securityToken: sessionToken,
      };

      const newProfile: LawyerProfile = {
        ...profile,
        name: setupName.trim() || profile.name || 'Advogado(a)',
        specialty: setupSpecialty || profile.specialty || 'Direito Cível',
      };

      StorageService.saveSecurity(newSecurity);
      StorageService.saveProfile(newProfile);
      StorageService.setSessionPass(sessionToken, setupRemember);

      onSaveSecurity(newSecurity);
      onSaveProfile(newProfile);
      onUnlockSuccess(sessionToken);
    } catch (err: any) {
      setErrorMessage('Erro ao configurar segurança: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Unlock App
  const handleUnlockSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!unlockPin) {
      setErrorMessage('Digite seu PIN de acesso.');
      return;
    }

    setIsLoading(true);
    try {
      const currentHash = await hashSecurityPin(unlockPin);

      if (currentHash === securitySettings.pinHash) {
        const sessionToken = 'pass_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        StorageService.setSessionPass(sessionToken, securitySettings.rememberDevice);
        onUnlockSuccess(sessionToken);
        setUnlockPin('');
      } else {
        setErrorMessage('PIN de acesso incorreto. Tente novamente.');
      }
    } catch (err: any) {
      setErrorMessage('Erro ao validar acesso: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Append digit for on-screen numeric keypad
  const handleKeypadPress = (digit: string) => {
    if (unlockPin.length < 8) {
      const newPin = unlockPin + digit;
      setUnlockPin(newPin);
      setErrorMessage('');
    }
  };

  const handleKeypadBackspace = () => {
    setUnlockPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  // Emergency reset function
  const handleEmergencyReset = () => {
    if (window.confirm('Atenção: Ao redefinir o acesso, um novo PIN será solicitado. Seus dados cadastrados serão mantidos. Deseja continuar?')) {
      const resetSecurity: SecuritySettings = {
        isConfigured: false,
        autoLockMinutes: 15,
        rememberDevice: true,
      };
      StorageService.saveSecurity(resetSecurity);
      onSaveSecurity(resetSecurity);
      setShowForgotModal(false);
      setUnlockPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-[#C5A059]/40 rounded-sm shadow-2xl p-5 sm:p-6 my-auto text-white space-y-5 relative">
        
        {/* Top Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 bg-[#111111] border border-[#C5A059]/40 rounded-sm flex items-center justify-center shadow-lg">
            <JusticeLogo size={36} />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-[#C5A059] uppercase tracking-widest font-['Cinzel',serif]">
              Tec Justiça <span className="text-white text-xs font-semibold">Lite</span>
            </h2>
            <p className="text-[11px] text-white/50 mt-0.5 tracking-wider uppercase">
              {isFirstTime ? 'Configuração de Acesso Seguro' : 'Acesso Seguro & Confidencial'}
            </p>
          </div>
        </div>

        {/* Error message alert */}
        {errorMessage && (
          <div className="bg-red-950/30 border border-red-500/40 p-3 rounded-sm text-xs text-red-200 flex items-center gap-2">
            <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* MODE 1: First-Time Setup */}
        {isFirstTime ? (
          <form onSubmit={handleSetupSubmit} className="space-y-4 text-xs">
            <div className="bg-[#111111] p-3 rounded-sm border border-white/10 space-y-1">
              <p className="text-[#C5A059] font-bold text-[11px] flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck size={13} /> Proteção de Dados do Escritório
              </p>
              <p className="text-white/60 text-[11px] leading-relaxed">
                Crie um PIN de acesso seguro para proteger os dados de clientes, causas e teses no seu dispositivo.
              </p>
            </div>

            <div>
              <label className="block text-white/70 font-medium mb-1 uppercase tracking-wider text-[10px]">
                Seu Nome / Dr(a). <span className="text-[#C5A059]">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Dr. Wagner Silva"
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
                className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                required
              />
            </div>

            <div>
              <label className="block text-white/70 font-medium mb-1 uppercase tracking-wider text-[10px]">
                Área de Atuação Principal
              </label>
              <select
                value={setupSpecialty}
                onChange={(e) => setSetupSpecialty(e.target.value)}
                className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
              >
                <option value="Direito Cível">Direito Cível</option>
                <option value="Direito Penal / Criminalista">Direito Penal / Criminalista</option>
                <option value="Direito de Família e Sucessões">Direito de Família e Sucessões</option>
                <option value="Direito do Trabalho">Direito do Trabalho</option>
                <option value="Direito do Consumidor">Direito do Consumidor</option>
                <option value="Direito Tributário">Direito Tributário</option>
                <option value="Direito Previdenciário">Direito Previdenciário</option>
                <option value="Direito Empresarial">Direito Empresarial</option>
                <option value="Direito Imobiliário">Direito Imobiliário</option>
                <option value="Geral">Direito Geral / Outra</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/70 font-medium mb-1 uppercase tracking-wider text-[10px]">
                  Criar PIN (4 a 6 dígitos) <span className="text-[#C5A059]">*</span>
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  placeholder="••••"
                  value={setupPin}
                  onChange={(e) => setSetupPin(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-center text-sm font-mono tracking-widest text-[#C5A059] focus:outline-none focus:border-[#C5A059]"
                  required
                />
              </div>

              <div>
                <label className="block text-white/70 font-medium mb-1 uppercase tracking-wider text-[10px]">
                  Confirmar PIN <span className="text-[#C5A059]">*</span>
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  placeholder="••••"
                  value={setupPinConfirm}
                  onChange={(e) => setSetupPinConfirm(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-center text-sm font-mono tracking-widest text-[#C5A059] focus:outline-none focus:border-[#C5A059]"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="setupRemember"
                checked={setupRemember}
                onChange={(e) => setSetupRemember(e.target.checked)}
                className="rounded-none border-white/20 text-[#C5A059] focus:ring-0 bg-[#111111]"
              />
              <label htmlFor="setupRemember" className="text-[11px] text-white/70 cursor-pointer">
                Salvar Passe de Acesso Seguro neste dispositivo (PWA)
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold uppercase tracking-widest text-xs transition-all shadow-md flex items-center justify-center gap-2 mt-3 disabled:opacity-40"
            >
              <KeyRound size={15} />
              <span>{isLoading ? 'Configurando...' : 'Criar Passe & Entrar'}</span>
            </button>
          </form>
        ) : (
          /* MODE 2: Unlock App Screen */
          <div className="space-y-4">
            {profile.name && (
              <div className="text-center">
                <p className="text-xs text-white/80 font-medium">
                  Olá, <span className="text-[#C5A059] font-bold">{profile.name}</span>
                </p>
                <p className="text-[10px] text-white/40">{profile.specialty}</p>
              </div>
            )}

            {/* PIN Display Field */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={8}
                value={unlockPin}
                onChange={(e) => setUnlockPin(e.target.value)}
                placeholder="Digite seu PIN"
                className="w-full bg-[#111111] border border-[#C5A059]/40 rounded-sm py-3 px-4 text-center text-lg font-mono tracking-widest text-[#C5A059] placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUnlockSubmit();
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-white/40 hover:text-white"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Numeric Keypad for Mobile Friendly Input */}
            <div className="grid grid-cols-3 gap-2 pt-1 max-w-[280px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num)}
                  className="h-11 bg-[#111111] hover:bg-[#1a1a1a] active:bg-[#C5A059]/20 border border-white/10 hover:border-[#C5A059]/40 text-base font-mono text-white rounded-sm transition-colors flex items-center justify-center font-bold"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleKeypadBackspace}
                className="h-11 bg-[#111111] hover:bg-[#1a1a1a] border border-white/10 text-xs text-white/60 rounded-sm transition-colors flex items-center justify-center uppercase tracking-wider"
              >
                Apagar
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="h-11 bg-[#111111] hover:bg-[#1a1a1a] active:bg-[#C5A059]/20 border border-white/10 text-base font-mono text-white rounded-sm transition-colors flex items-center justify-center font-bold"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleUnlockSubmit()}
                className="h-11 bg-[#C5A059] hover:bg-[#D4B069] text-black font-bold text-xs rounded-sm transition-colors flex items-center justify-center uppercase tracking-widest"
              >
                Entrar
              </button>
            </div>

            {/* Quick Actions / Forgot PIN */}
            <div className="flex items-center justify-between text-[11px] text-white/40 pt-2 border-t border-white/5">
              <span className="flex items-center gap-1">
                <Lock size={12} className="text-[#C5A059]" /> Proteção Criptografada
              </span>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[#C5A059] hover:underline uppercase tracking-wider text-[10px]"
              >
                Redefinir PIN
              </button>
            </div>
          </div>
        )}

        {/* Emergency Reset confirmation modal */}
        {showForgotModal && (
          <div className="absolute inset-0 bg-[#0a0a0a] p-6 rounded-sm flex flex-col justify-between z-20 border border-[#C5A059]/50">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest font-['Cinzel',serif] flex items-center gap-2 text-[#C5A059]">
                <ShieldCheck size={14} /> Redefinição de Acesso
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Para sua conveniência, a redefinição permitirá cadastrar um novo PIN de acesso sem apagar suas causas, clientes e tarefas salvas no dispositivo.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-xs text-white uppercase tracking-wider"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEmergencyReset}
                className="px-3.5 py-1.5 bg-[#C5A059] hover:bg-[#D4B069] text-black font-bold text-xs uppercase tracking-wider"
              >
                Confirmar e Criar Novo PIN
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
