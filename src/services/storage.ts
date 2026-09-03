import { LegalCase, Task, LawyerProfile, SecuritySettings } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'tec_justica_profile_v2',
  CASES: 'tec_justica_cases_v2',
  TASKS: 'tec_justica_tasks_v2',
  CATEGORIES: 'tec_justica_categories_v2',
  SECURITY: 'tec_justica_security_v2',
  SESSION_PASS: 'tec_justica_session_pass_v2',
  LEGACY_PROFILE: 'tec_justica_profile_v1',
  LEGACY_CASES: 'tec_justica_cases_v1',
  LEGACY_TASKS: 'tec_justica_tasks_v1',
  LEGACY_CATEGORIES: 'tec_justica_categories_v1',
};

// Web Crypto SHA-256 for secure PIN/Password hashing
export async function hashSecurityPin(pinOrPassword: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pinOrPassword.trim() + '_tec_justica_salt_2026');
  if (crypto && crypto.subtle) {
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback below
    }
  }
  // Simple deterministic fallback for non-crypto contexts
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data[i];
    hash |= 0;
  }
  return 'fallback_' + Math.abs(hash).toString(16);
}

export const StorageService = {
  // --- Profile Storage ---
  loadProfile(): LawyerProfile {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE) || localStorage.getItem(STORAGE_KEYS.LEGACY_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error loading profile:', e);
    }
    return {
      name: '',
      specialty: 'Direito Cível',
    };
  },

  saveProfile(profile: LawyerProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Error saving profile:', e);
    }
  },

  // --- Security Settings & Access Pass ---
  loadSecurity(): SecuritySettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SECURITY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error loading security:', e);
    }
    return {
      isConfigured: false,
      autoLockMinutes: 15,
      rememberDevice: true,
    };
  },

  saveSecurity(settings: SecuritySettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Error saving security:', e);
    }
  },

  // Session Pass Token verification
  getSessionPass(): { token: string; timestamp: number } | null {
    try {
      const session = sessionStorage.getItem(STORAGE_KEYS.SESSION_PASS) || 
                      localStorage.getItem(STORAGE_KEYS.SESSION_PASS);
      if (!session) return null;
      return JSON.parse(session);
    } catch {
      return null;
    }
  },

  setSessionPass(token: string, persistInLocal = false): void {
    const data = JSON.stringify({ token, timestamp: Date.now() });
    try {
      sessionStorage.setItem(STORAGE_KEYS.SESSION_PASS, data);
      if (persistInLocal) {
        localStorage.setItem(STORAGE_KEYS.SESSION_PASS, data);
      }
    } catch (e) {
      console.warn('Error setting session pass:', e);
    }
  },

  clearSessionPass(): void {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.SESSION_PASS);
      localStorage.removeItem(STORAGE_KEYS.SESSION_PASS);
    } catch (e) {
      console.warn('Error clearing session pass:', e);
    }
  },

  // --- Cases & Clients Storage ---
  loadCases(): LegalCase[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CASES) || localStorage.getItem(STORAGE_KEYS.LEGACY_CASES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error loading cases:', e);
    }
    return [];
  },

  saveCases(cases: LegalCase[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
    } catch (e) {
      console.warn('Error saving cases:', e);
    }
  },

  // --- Tasks Storage ---
  loadTasks(): Task[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS) || localStorage.getItem(STORAGE_KEYS.LEGACY_TASKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error loading tasks:', e);
    }
    return [];
  },

  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Error saving tasks:', e);
    }
  },

  // --- Categories Storage ---
  loadCategories(): string[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES) || localStorage.getItem(STORAGE_KEYS.LEGACY_CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error loading categories:', e);
    }
    return [];
  },

  saveCategories(categories: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.warn('Error saving categories:', e);
    }
  },

  // --- Export & Import Backup ---
  exportFullBackup(): string {
    const backup = {
      app: 'Tec Justiça Lite',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      profile: this.loadProfile(),
      cases: this.loadCases(),
      tasks: this.loadTasks(),
      categories: this.loadCategories(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importFullBackup(jsonString: string): { success: boolean; message: string; count?: { cases: number; tasks: number } } {
    try {
      const data = JSON.parse(jsonString);
      if (data.app !== 'Tec Justiça Lite' && !data.cases && !data.tasks) {
        return { success: false, message: 'Arquivo de backup inválido ou incompatível.' };
      }

      if (data.profile) this.saveProfile(data.profile);
      if (Array.isArray(data.cases)) this.saveCases(data.cases);
      if (Array.isArray(data.tasks)) this.saveTasks(data.tasks);
      if (Array.isArray(data.categories)) this.saveCategories(data.categories);

      return {
        success: true,
        message: 'Backup restaurado com sucesso no seu dispositivo!',
        count: {
          cases: Array.isArray(data.cases) ? data.cases.length : 0,
          tasks: Array.isArray(data.tasks) ? data.tasks.length : 0,
        },
      };
    } catch (err: any) {
      return { success: false, message: 'Falha ao processar arquivo: ' + err.message };
    }
  },
};
