export type LegalSpecialty = 
  | 'Geral'
  | 'Direito Penal / Criminalista'
  | 'Direito Cível'
  | 'Direito de Família e Sucessões'
  | 'Direito do Trabalho'
  | 'Direito Tributário'
  | 'Direito Previdenciário'
  | 'Direito Empresarial'
  | 'Direito do Consumidor'
  | 'Direito Imobiliário'
  | 'Direito Administrativo / Público'
  | 'Outra Especialidade';

export interface LawyerProfile {
  name: string;
  specialty: LegalSpecialty | string;
  oabNumber?: string;
  oabState?: string;
  email?: string;
  phone?: string;
  customGeminiApiKey?: string; // Opcional: caso o advogado queira usar sua chave própria
}

export interface SecuritySettings {
  isConfigured: boolean;
  pinHash?: string;
  autoLockMinutes: number; // 0 para desativar, ou 5, 15, 30 min
  rememberDevice: boolean;
  securityToken?: string;
}

export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority?: TaskPriority;
  caseId?: string; // Linked legal case ID
  notes?: string;
}

export interface LegalCase {
  id: string;
  // Client Info (integrado no mesmo cadastro)
  clientName: string;
  clientDocument?: string; // CPF ou CNPJ
  clientPhone?: string; // WhatsApp / Telefone
  clientEmail?: string;
  clientNotes?: string;
  clientType?: 'Pessoa Física' | 'Pessoa Jurídica';

  // Lawsuit Info
  title: string; // Ex: Ação de Reparação de Danos
  processNumber?: string; // Número CNJ
  opponentName?: string;
  courtOrVara?: string; // Ex: 2ª Vara Cível de SP
  specialty: string;
  facts: string; // Descrição dos fatos da causa
  objectives?: string; // Pedidos / Teses almejadas
  circumstances?: string; // Novas circunstâncias / observações dinâmicas
  circumstancesHistory?: Array<{ text: string; addedAt: string }>; // Histórico de circunstâncias
  
  // Orçamento & Honorários Advocatícios
  budgetAmount?: string; // Ex: R$ 3.500,00
  paymentMethod?: 'À Vista / PIX' | 'Parcelado' | 'Entrada + Parcelas' | 'Honorários de Êxito / Percentual' | 'A Combinar';
  downPayment?: string; // Ex: R$ 1.000,00
  installmentsCount?: number; // Ex: 3
  installmentValue?: string; // Ex: R$ 833,33
  paymentDetails?: string; // Ex: Vencimento todo dia 10 via PIX/Transferência

  status: 'Em Andamento' | 'Fase Inicial' | 'Instrução' | 'Julgamento' | 'Recurso' | 'Concluído';
  createdAt: string;
  updatedAt: string;
  lastAiStrategy?: LegalStrategyResult;
}

export interface ApplicableLaw {
  codeOrLaw: string; // Ex: Código de Processo Civil (CPC), art. 300
  articleDescription: string;
  relevance: string; // Por que se aplica a este caso
}

export interface DefenseArgument {
  phase: string; // Ex: "Preliminar de Mérito", "Tese Principal", "Tese Subsidiária", "Dos Pedidos"
  argumentTitle: string;
  details: string;
  jurisprudenceTip?: string;
}

export interface LegalStrategyResult {
  lawyerGreeting: string;
  summaryOfCase: string;
  applicableLaws: ApplicableLaw[];
  defenseStoryline: DefenseArgument[];
  strategicTips: string[];
  risksAndAlerts: string[];
  actionChecklist: string[];
  googleSearchQueries?: string[];
  generatedAt: string;
  isOfflineFallback?: boolean;
}
