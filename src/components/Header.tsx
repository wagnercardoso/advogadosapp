import React, { useState, useEffect } from 'react';
import { JusticeLogo } from './JusticeLogo';
import { LawyerProfile } from '../types';
import { User, Scale, Lock, Download, Sparkles, Clock, Building2 } from 'lucide-react';

interface HeaderProps {
  profile: LawyerProfile;
  onOpenProfile: () => void;
  onLockApp: () => void;
  activeTab: 'management' | 'deadlines' | 'about';
  setActiveTab: (tab: 'management' | 'deadlines' | 'about') => void;
  pendingAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenProfile,
  onLockApp,
  activeTab,
  setActiveTab,
  pendingAlertsCount,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#C5A059]/30">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-sm bg-[#111111] border border-[#C5A059]/40 shadow-sm flex items-center justify-center">
            <JusticeLogo size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-serif tracking-widest text-[#C5A059] uppercase flex items-center gap-1.5 font-['Cinzel',serif] font-bold">
                Tec Justiça <span className="text-white text-xs font-semibold tracking-wider">Lite</span>
              </h1>
            </div>
            <p className="text-[11px] text-white/50 truncate max-w-[170px] sm:max-w-none">
              {profile.name ? (
                <span className="flex items-center gap-1 text-white/80">
                  <span className="text-[#C5A059] font-medium">⚖️ {profile.name}</span>
                  {profile.oabNumber && (
                    <span className="text-[#C5A059]/70 text-[10px] font-mono">
                      (OAB/{profile.oabState || 'UF'} {profile.oabNumber})
                    </span>
                  )}
                  <span className="text-white/30 hidden sm:inline">•</span>
                  <span className="text-white/60 truncate hidden sm:inline">{profile.specialty}</span>
                </span>
              ) : (
                <span className="text-[#C5A059] cursor-pointer hover:underline text-[10px] uppercase tracking-wider" onClick={onOpenProfile}>
                  + Configurar Perfil do Advogado
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons: PWA Install + Lock App + Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* PWA Install Button (if browser supports install prompt) */}
          {canInstall && (
            <button
              onClick={handleInstallClick}
              className="px-2.5 py-1.5 rounded-sm bg-[#16a34a]/20 hover:bg-[#16a34a]/30 border border-[#C5A059]/50 text-[#C5A059] text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1"
              title="Instalar Tec Justiça Lite no Celular"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Instalar App</span>
            </button>
          )}

          {/* Quick Lock App Button */}
          <button
            onClick={onLockApp}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-sm bg-[#111111] hover:bg-[#1a1a1a] border border-white/10 hover:border-[#C5A059]/40 text-xs text-white/80 hover:text-[#C5A059] transition-all flex items-center gap-1.5"
            title="Bloquear Aplicativo (Proteger Dados)"
          >
            <Lock size={13} />
            <span className="hidden sm:inline text-[10px] uppercase tracking-wider">Bloquear</span>
          </button>

          {/* Profile Trigger */}
          <button
            id="profile-trigger-btn"
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-sm bg-[#111111] hover:bg-[#191919] border border-[#C5A059]/40 text-xs text-white transition-all shadow-sm group"
            title="Perfil & Configurações"
          >
            <User size={14} className="text-[#C5A059] group-hover:scale-110 transition-transform" />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-medium text-white/90">
                {profile.name ? profile.name.split(' ')[0] : 'Perfil'}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-[#C5A059]">
                Configurações
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar - Unified and Streamlined */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <nav className="flex space-x-1 border-t border-white/5 pt-1.5 pb-1.5 text-xs font-medium">
          <button
            id="nav-tab-management"
            onClick={() => setActiveTab('management')}
            className={`flex-1 py-2 px-2 text-center rounded-sm transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider text-[11px] sm:text-xs ${
              activeTab === 'management'
                ? 'bg-white/10 text-white font-bold border-b-2 sm:border-b-0 sm:border border-[#C5A059] shadow-sm'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Scale size={14} className="text-[#C5A059]" />
            <span>Gestão & Clientes</span>
            <span className="px-1 py-0.2 bg-[#16a34a]/20 text-[#C5A059] text-[9px] rounded font-bold uppercase hidden sm:inline">
              IA & Contratos
            </span>
          </button>

          <button
            id="nav-tab-deadlines"
            onClick={() => setActiveTab('deadlines')}
            className={`py-2 px-4 text-center rounded-sm transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider text-[11px] sm:text-xs relative ${
              activeTab === 'deadlines'
                ? 'bg-white/10 text-white font-bold border-b-2 sm:border-b-0 sm:border border-[#C5A059] shadow-sm'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock size={13} className="text-[#C5A059]" />
            <span>Prazos</span>
            {pendingAlertsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#16a34a] text-white text-[10px] font-bold">
                {pendingAlertsCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-about"
            onClick={() => setActiveTab('about')}
            className={`py-2 px-3 text-center rounded-sm transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider text-[11px] sm:text-xs ${
              activeTab === 'about'
                ? 'bg-white/10 text-white font-bold border-b-2 sm:border-b-0 sm:border border-[#C5A059] shadow-sm'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 size={13} className="text-[#C5A059]" />
            <span className="hidden sm:inline">Empresa</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
