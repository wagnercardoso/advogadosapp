import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Task, LegalCase, LawyerProfile, SecuritySettings } from './types';
import { StorageService } from './services/storage';
import { Header } from './components/Header';
import { UnifiedDashboardView } from './components/UnifiedDashboardView';
import { DeadlinesAlertsView } from './components/DeadlinesAlertsView';
import { AboutView } from './components/AboutView';
import { ProfileModal } from './components/ProfileModal';
import { AuthLockModal } from './components/AuthLockModal';
import { CompanyFooter } from './components/CompanyFooter';

export default function App() {
  // Security & Authentication State
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(() => StorageService.loadSecurity());
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const sec = StorageService.loadSecurity();
    if (!sec.isConfigured) return true; // Show setup on first run
    const session = StorageService.getSessionPass();
    return !session; // Locked if no valid session pass
  });

  // Application state
  const [tasks, setTasks] = useState<Task[]>(() => StorageService.loadTasks());
  const [categories, setCategories] = useState<string[]>(() => StorageService.loadCategories());
  const [cases, setCases] = useState<LegalCase[]>(() => StorageService.loadCases());
  const [profile, setProfile] = useState<LawyerProfile>(() => StorageService.loadProfile());

  // Active view tab: 'management' (Clientes, Causas & Agenda unificados) | 'deadlines' | 'about'
  const [activeTab, setActiveTab] = useState<'management' | 'deadlines' | 'about'>('management');

  // Profile modal toggle
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Selected case for AI strategy modal
  const [selectedCaseForModal, setSelectedCaseForModal] = useState<LegalCase | null>(null);

  // Inactivity auto-lock timer
  const lastActivityRef = useRef<number>(Date.now());

  const handleUserActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    const intervalId = setInterval(() => {
      if (
        !isLocked &&
        securitySettings.isConfigured &&
        securitySettings.autoLockMinutes > 0
      ) {
        const idleMinutes = (Date.now() - lastActivityRef.current) / 60000;
        if (idleMinutes >= securitySettings.autoLockMinutes) {
          StorageService.clearSessionPass();
          setIsLocked(true);
        }
      }
    }, 30000);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      clearInterval(intervalId);
    };
  }, [isLocked, securitySettings, handleUserActivity]);

  // Synchronize state with StorageService
  useEffect(() => {
    StorageService.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    StorageService.saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    StorageService.saveCases(cases);
  }, [cases]);

  useEffect(() => {
    StorageService.saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    StorageService.saveSecurity(securitySettings);
  }, [securitySettings]);

  // Lock App manually
  const handleLockApp = () => {
    StorageService.clearSessionPass();
    setIsLocked(true);
  };

  // Unlock success callback
  const handleUnlockSuccess = (_token: string) => {
    setIsLocked(false);
  };

  // Refresh all state from storage (after backup restore)
  const handleRefreshData = () => {
    setTasks(StorageService.loadTasks());
    setCategories(StorageService.loadCategories());
    setCases(StorageService.loadCases());
    setProfile(StorageService.loadProfile());
    setSecuritySettings(StorageService.loadSecurity());
  };

  // Handle adding tasks from AI recommended checklist
  const handleAddTasksFromChecklist = (newTasksPartial: Partial<Task>[]) => {
    const createdTasks: Task[] = newTasksPartial.map((partial) => ({
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: partial.title || 'Nova tarefa jurídica',
      category: partial.category || 'Prazos / Peças',
      completed: false,
      createdAt: new Date().toISOString(),
      priority: partial.priority || 'alta',
      caseId: partial.caseId,
    }));

    setTasks((prev) => [...createdTasks, ...prev]);

    // Ensure category exists
    const newCats = createdTasks.map((t) => t.category).filter(Boolean);
    setCategories((prev) => Array.from(new Set([...prev, ...newCats])));
  };

  const handleSelectCaseForStrategy = (caseItem: LegalCase) => {
    setSelectedCaseForModal(caseItem);
    setActiveTab('management');
  };

  // Count pending alerts
  const pendingAlertsCount = tasks.filter(
    (t) => !t.completed && (t.dueDate || t.priority === 'urgente' || t.priority === 'alta')
  ).length;

  return (
    <div className="min-h-screen bg-[#050505] bg-[radial-gradient(circle_at_top_right,_#141414_0%,_#050505_100%)] text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif] antialiased">
      {/* Top Header & Navigation */}
      <Header
        profile={profile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLockApp={handleLockApp}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingAlertsCount={pendingAlertsCount}
      />

      {/* Lawyer Name/Specialty Setup Alert if empty */}
      {!profile.name && !isLocked && (
        <div className="max-w-4xl mx-auto w-full px-4 pt-4">
          <div className="bg-[#0c0c0c] border border-[#C5A059]/40 p-4 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-white/90 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-[#C5A059] text-xl">⚖️</span>
              <div>
                <p className="font-bold text-white uppercase tracking-wider font-['Cinzel',serif] text-xs">
                  Bem-vindo(a) ao Tec Justiça Lite
                </p>
                <p className="text-white/50 text-[11px] mt-0.5">
                  Configure seu nome e área de atuação para personalizar suas defesas, contratos e análises com IA.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#C5A059] hover:bg-[#D4B069] text-black font-bold uppercase tracking-widest text-[10px] transition-all flex-shrink-0"
            >
              Configurar Perfil
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-5">
        {activeTab === 'management' && (
          <UnifiedDashboardView
            cases={cases}
            setCases={setCases}
            tasks={tasks}
            setTasks={setTasks}
            categories={categories}
            setCategories={setCategories}
            profile={profile}
            onAddTasksFromChecklist={handleAddTasksFromChecklist}
            selectedCaseForModal={selectedCaseForModal}
            setSelectedCaseForModal={setSelectedCaseForModal}
          />
        )}

        {activeTab === 'deadlines' && (
          <DeadlinesAlertsView
            tasks={tasks}
            setTasks={setTasks}
            cases={cases}
            onSelectCaseForStrategy={handleSelectCaseForStrategy}
            onGoToAgenda={() => setActiveTab('management')}
          />
        )}

        {activeTab === 'about' && <AboutView />}
      </main>

      {/* Authentication & App Lock Modal */}
      <AuthLockModal
        isOpen={isLocked}
        securitySettings={securitySettings}
        profile={profile}
        onUnlockSuccess={handleUnlockSuccess}
        onSaveProfile={(p) => setProfile(p)}
        onSaveSecurity={(s) => setSecuritySettings(s)}
      />

      {/* Lawyer Profile & Settings Modal */}
      <ProfileModal
        profile={profile}
        securitySettings={securitySettings}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSaveProfile={(newProfile) => setProfile(newProfile)}
        onSaveSecurity={(newSec) => setSecuritySettings(newSec)}
        onRefreshData={handleRefreshData}
      />

      {/* Company Footer */}
      <CompanyFooter />
    </div>
  );
}
