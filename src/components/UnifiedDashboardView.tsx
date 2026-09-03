import React, { useState, useMemo } from 'react';
import { LegalCase, LawyerProfile, Task, TaskPriority } from '../types';
import { ContractPdfGenerator } from '../services/contractPdfGenerator';
import { CaseDetailsModal } from './CaseDetailsModal';
import {
  Scale,
  Plus,
  Sparkles,
  Trash2,
  Edit3,
  User,
  Phone,
  MessageCircle,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  FileDown,
  Calendar,
  Clock,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  X,
  CheckSquare
} from 'lucide-react';

interface UnifiedDashboardViewProps {
  cases: LegalCase[];
  setCases: React.Dispatch<React.SetStateAction<LegalCase[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  profile: LawyerProfile;
  onAddTasksFromChecklist?: (tasks: Partial<Task>[]) => void;
  selectedCaseForModal?: LegalCase | null;
  setSelectedCaseForModal?: (c: LegalCase | null) => void;
}

export const UnifiedDashboardView: React.FC<UnifiedDashboardViewProps> = ({
  cases,
  setCases,
  tasks,
  setTasks,
  categories,
  setCategories,
  profile,
  onAddTasksFromChecklist,
  selectedCaseForModal: externalSelectedCase,
  setSelectedCaseForModal: externalSetSelectedCase,
}) => {
  // Modal & Edit states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [internalSelectedCase, setInternalSelectedCase] = useState<LegalCase | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('Todas');
  const [activeSubTab, setActiveSubTab] = useState<'cases' | 'agenda'>('cases');

  // Quick feedback alert for contract generated
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);

  const activeModalCase = externalSelectedCase !== undefined ? externalSelectedCase : internalSelectedCase;
  const setModalCase = (c: LegalCase | null) => {
    if (externalSetSelectedCase) externalSetSelectedCase(c);
    setInternalSelectedCase(c);
  };

  // --- Simplified Form States ---
  // Essential Client Fields
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientType, setClientType] = useState<'Pessoa Física' | 'Pessoa Jurídica'>('Pessoa Física');

  // Essential Lawsuit Fields
  const [title, setTitle] = useState('');
  const [specialty, setSpecialty] = useState(profile.specialty || 'Direito Cível');
  const [facts, setFacts] = useState('');

  // Budget & Honorários Fields
  const [budgetAmount, setBudgetAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<LegalCase['paymentMethod']>('À Vista / PIX');
  const [downPayment, setDownPayment] = useState('');
  const [installmentsCount, setInstallmentsCount] = useState<number | ''>('');
  const [installmentValue, setInstallmentValue] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');

  // Optional Advanced Fields (Collapsed by default)
  const [clientDocument, setClientDocument] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [processNumber, setProcessNumber] = useState('');
  const [courtOrVara, setCourtOrVara] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const [objectives, setObjectives] = useState('');
  const [status, setStatus] = useState<LegalCase['status']>('Em Andamento');

  // --- Quick Task input state for integrated Agenda ---
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskCategory, setQuickTaskCategory] = useState(categories[0] || 'Geral');
  const [quickTaskCaseId, setQuickTaskCaseId] = useState('');
  const [quickTaskDueDate, setQuickTaskDueDate] = useState('');

  const resetForm = () => {
    setClientName('');
    setClientPhone('');
    setClientType('Pessoa Física');
    setTitle('');
    setSpecialty(profile.specialty || 'Direito Cível');
    setFacts('');
    setBudgetAmount('');
    setPaymentMethod('À Vista / PIX');
    setDownPayment('');
    setInstallmentsCount('');
    setInstallmentValue('');
    setPaymentDetails('');
    setClientDocument('');
    setClientEmail('');
    setProcessNumber('');
    setCourtOrVara('');
    setOpponentName('');
    setObjectives('');
    setStatus('Em Andamento');
    setEditingCaseId(null);
    setShowAddForm(false);
    setShowAdvancedFields(false);
  };

  const handleStartEdit = (caseItem: LegalCase) => {
    setEditingCaseId(caseItem.id);
    setClientName(caseItem.clientName || '');
    setClientPhone(caseItem.clientPhone || '');
    setClientType(caseItem.clientType || 'Pessoa Física');
    setTitle(caseItem.title || '');
    setSpecialty(caseItem.specialty || profile.specialty || 'Direito Cível');
    setFacts(caseItem.facts || '');
    setBudgetAmount(caseItem.budgetAmount || '');
    setPaymentMethod(caseItem.paymentMethod || 'À Vista / PIX');
    setDownPayment(caseItem.downPayment || '');
    setInstallmentsCount(caseItem.installmentsCount || '');
    setInstallmentValue(caseItem.installmentValue || '');
    setPaymentDetails(caseItem.paymentDetails || '');
    setClientDocument(caseItem.clientDocument || '');
    setClientEmail(caseItem.clientEmail || '');
    setProcessNumber(caseItem.processNumber || '');
    setCourtOrVara(caseItem.courtOrVara || '');
    setOpponentName(caseItem.opponentName || '');
    setObjectives(caseItem.objectives || '');
    setStatus(caseItem.status || 'Em Andamento');
    setShowAddForm(true);
    if (caseItem.clientDocument || caseItem.processNumber || caseItem.courtOrVara) {
      setShowAdvancedFields(true);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCase = (actionAfter: 'none' | 'consultAi' | 'exportPdf') => {
    if (!clientName.trim() || !title.trim() || !facts.trim()) {
      alert('Por favor, preencha os campos essenciais: Nome do Cliente, Título da Ação e Resumo dos Fatos.');
      return;
    }

    let targetCase: LegalCase;

    if (editingCaseId) {
      const existing = cases.find((c) => c.id === editingCaseId);
      targetCase = {
        ...existing!,
        clientName: clientName.trim(),
        clientType,
        clientPhone: clientPhone.trim() || undefined,
        clientDocument: clientDocument.trim() || undefined,
        clientEmail: clientEmail.trim() || undefined,
        title: title.trim(),
        specialty: specialty.trim() || profile.specialty || 'Direito Cível',
        facts: facts.trim(),
        budgetAmount: budgetAmount.trim() || undefined,
        paymentMethod,
        downPayment: downPayment.trim() || undefined,
        installmentsCount: installmentsCount ? Number(installmentsCount) : undefined,
        installmentValue: installmentValue.trim() || undefined,
        paymentDetails: paymentDetails.trim() || undefined,
        processNumber: processNumber.trim() || undefined,
        courtOrVara: courtOrVara.trim() || undefined,
        opponentName: opponentName.trim() || undefined,
        objectives: objectives.trim() || undefined,
        status,
        updatedAt: new Date().toISOString(),
      };

      setCases((prev) => prev.map((c) => (c.id === editingCaseId ? targetCase : c)));
    } else {
      targetCase = {
        id: 'case_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        clientName: clientName.trim(),
        clientType,
        clientPhone: clientPhone.trim() || undefined,
        clientDocument: clientDocument.trim() || undefined,
        clientEmail: clientEmail.trim() || undefined,
        title: title.trim(),
        specialty: specialty.trim() || profile.specialty || 'Direito Cível',
        facts: facts.trim(),
        budgetAmount: budgetAmount.trim() || undefined,
        paymentMethod,
        downPayment: downPayment.trim() || undefined,
        installmentsCount: installmentsCount ? Number(installmentsCount) : undefined,
        installmentValue: installmentValue.trim() || undefined,
        paymentDetails: paymentDetails.trim() || undefined,
        processNumber: processNumber.trim() || undefined,
        courtOrVara: courtOrVara.trim() || undefined,
        opponentName: opponentName.trim() || undefined,
        objectives: objectives.trim() || undefined,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCases((prev) => [targetCase, ...prev]);
    }

    resetForm();

    if (actionAfter === 'consultAi') {
      setModalCase(targetCase);
    } else if (actionAfter === 'exportPdf') {
      try {
        ContractPdfGenerator.downloadContractPdf(targetCase, profile);
        setPdfSuccessMessage(`Contrato de honorários gerado com sucesso para ${targetCase.clientName}!`);
        setTimeout(() => setPdfSuccessMessage(null), 5000);
      } catch (err: any) {
        alert('Erro ao exportar PDF: ' + (err.message || 'Tente novamente'));
      }
    }
  };

  const handleDeleteCase = (caseId: string, caseTitle: string, clientName: string) => {
    if (window.confirm(`Deseja excluir o caso "${caseTitle}" do cliente ${clientName}?`)) {
      setCases((prev) => prev.filter((c) => c.id !== caseId));
      if (activeModalCase?.id === caseId) {
        setModalCase(null);
      }
    }
  };

  const handleUpdateCase = (updated: LegalCase) => {
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setModalCase(updated);
  };

  // Quick Task Creation
  const handleAddQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    const newTask: Task = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: quickTaskTitle.trim(),
      category: quickTaskCategory || 'Geral',
      completed: false,
      createdAt: new Date().toISOString(),
      caseId: quickTaskCaseId || undefined,
      dueDate: quickTaskDueDate || undefined,
      priority: 'alta',
    };

    setTasks((prev) => [newTask, ...prev]);
    if (!categories.includes(quickTaskCategory)) {
      setCategories((prev) => [...prev, quickTaskCategory]);
    }

    setQuickTaskTitle('');
    setQuickTaskDueDate('');
    setQuickTaskCaseId('');
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.clientName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        c.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (c.processNumber && c.processNumber.includes(searchFilter)) ||
        (c.courtOrVara && c.courtOrVara.toLowerCase().includes(searchFilter.toLowerCase()));

      const matchesSpecialty = specialtyFilter === 'Todas' || c.specialty === specialtyFilter;
      return matchesSearch && matchesSpecialty;
    });
  }, [cases, searchFilter, specialtyFilter]);

  // Agenda stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-12">
      {/* Top Banner / Toast for PDF or Circunstâncias */}
      {pdfSuccessMessage && (
        <div className="p-3 bg-[#C5A059]/20 border border-[#C5A059] text-white text-xs rounded-sm flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="text-[#C5A059]" />
            <span>{pdfSuccessMessage}</span>
          </div>
          <button onClick={() => setPdfSuccessMessage(null)} className="text-white/60 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Header with Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 pt-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-white flex items-center gap-2 font-['Cinzel',serif] tracking-wider">
            <span className="w-1.5 h-5 bg-[#C5A059] inline-block"></span>
            Gestão Integrada: Clientes, Causas & Agenda
          </h2>
          <p className="text-white/50 text-xs mt-0.5">
            Cadastre rapidamente o cliente, defina o orçamento, gere o contrato em PDF e consulte teses com IA.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showAddForm) resetForm();
            else {
              resetForm();
              setShowAddForm(true);
            }
          }}
          className="bg-[#C5A059] hover:bg-[#D4B069] text-black font-bold text-xs uppercase py-2.5 px-4 tracking-widest transition-all shadow-sm flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>{showAddForm ? 'Fechar Formulário' : '+ Novo Cliente & Causa'}</span>
        </button>
      </div>

      {/* SIMPLIFIED CLIENT, CASE & BUDGET REGISTRATION FORM */}
      {showAddForm && (
        <div className="bg-[#0a0a0a] p-4 sm:p-6 rounded-sm border border-[#C5A059]/40 shadow-2xl space-y-5 transition-all animate-fadeIn">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-widest font-['Cinzel',serif] flex items-center gap-2 text-[#C5A059]">
                <Scale size={16} className="text-[#C5A059]" />
                {editingCaseId ? 'Editar Cliente & Processo' : 'Cadastro Rápido: Cliente, Demanda & Orçamento'}
              </h3>
              <p className="text-[11px] text-white/50 mt-0.5">
                Preencha os dados essenciais para gerar o contrato e a estratégia jurídica.
              </p>
            </div>
            {editingCaseId && (
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-[10px] uppercase font-mono border border-yellow-500/30">
                Modo Edição
              </span>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveCase('none');
            }}
            className="space-y-4"
          >
            {/* SEÇÃO 1: CLIENTE & DEMANDA (ESSENCIAIS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-white/80 font-medium mb-1 text-[10px] uppercase tracking-wider">
                  Nome do Cliente / Razão Social <span className="text-[#C5A059]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-white/80 font-medium mb-1 text-[10px] uppercase tracking-wider">
                  WhatsApp / Telefone de Contato
                </label>
                <input
                  type="tel"
                  placeholder="Ex: (11) 98765-4321"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-white/80 font-medium mb-1 text-[10px] uppercase tracking-wider">
                  Título / Identificação da Causa <span className="text-[#C5A059]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ação de Indenização por Danos Morais"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-white/80 font-medium mb-1 text-[10px] uppercase tracking-wider">
                  Área / Ramo do Direito
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="Direito Cível">Direito Cível</option>
                  <option value="Direito Penal / Criminalista">Direito Penal / Criminalista</option>
                  <option value="Direito do Trabalho">Direito do Trabalho</option>
                  <option value="Direito de Família e Sucessões">Direito de Família e Sucessões</option>
                  <option value="Direito do Consumidor">Direito do Consumidor</option>
                  <option value="Direito Tributário">Direito Tributário</option>
                  <option value="Direito Previdenciário">Direito Previdenciário</option>
                  <option value="Direito Empresarial">Direito Empresarial</option>
                  <option value="Direito Imobiliário">Direito Imobiliário</option>
                  <option value="Direito Administrativo / Público">Direito Administrativo / Público</option>
                  <option value="Geral">Outra Especialidade</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-white/80 font-medium mb-1 text-[10px] uppercase tracking-wider">
                  Resumo dos Fatos da Causa <span className="text-[#C5A059]">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Descreva de forma concisa o que ocorreu, alegações e situação fática..."
                  value={facts}
                  onChange={(e) => setFacts(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-sm p-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            {/* SEÇÃO 2: ORÇAMENTO & CONDIÇÕES DE PAGAMENTO (INTEGRADO AO CONTRATO) */}
            <div className="bg-[#0f0f0f] p-3.5 rounded-sm border border-[#C5A059]/30 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                <h4 className="text-[11px] font-bold text-[#C5A059] uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign size={14} /> Orçamento & Honorários Advocatícios
                </h4>
                <span className="text-[10px] text-white/40">
                  (Essas condições constarão no Contrato em PDF)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="block text-white/70 mb-1 text-[10px] uppercase tracking-wider">
                    Valor dos Honorários (R$)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: R$ 3.500,00 ou 20% de êxito"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    className="w-full bg-[#111111] border border-white/15 rounded-sm px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-1 text-[10px] uppercase tracking-wider">
                    Forma de Pagamento
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-[#111111] border border-white/15 rounded-sm px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="À Vista / PIX">À Vista / PIX</option>
                    <option value="Parcelado">Parcelado</option>
                    <option value="Entrada + Parcelas">Entrada + Parcelas</option>
                    <option value="Honorários de Êxito / Percentual">Honorários de Êxito (%)</option>
                    <option value="A Combinar">A Combinar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 mb-1 text-[10px] uppercase tracking-wider">
                    Qtd. de Parcelas / Entrada
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      max={36}
                      placeholder="Qtd (ex: 3)"
                      value={installmentsCount}
                      onChange={(e) => setInstallmentsCount(e.target.value ? Number(e.target.value) : '')}
                      className="w-1/2 bg-[#111111] border border-white/15 rounded-sm px-2 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                    />
                    <input
                      type="text"
                      placeholder="Entrada (R$)"
                      value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value)}
                      className="w-1/2 bg-[#111111] border border-white/15 rounded-sm px-2 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-white/70 mb-1 text-[10px] uppercase tracking-wider">
                    Vencimentos e Observações Financeiras (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Vencimento todo dia 10 via PIX; 1ª parcela paga no ato da assinatura..."
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    className="w-full bg-[#111111] border border-white/15 rounded-sm px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>
            </div>

            {/* EXPANDABLE OPTIONAL FIELDS */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                className="text-xs text-[#C5A059] hover:underline flex items-center gap-1 font-medium tracking-wide uppercase text-[10px] py-1"
              >
                {showAdvancedFields ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                <span>{showAdvancedFields ? 'Ocultar campos opcionais' : '+ Mais Detalhes Opcionais (CPF/CNPJ, Processo CNJ, Vara, Parte Contrária)'}</span>
              </button>

              {showAdvancedFields && (
                <div className="mt-2.5 p-3.5 bg-[#0a0a0a] rounded-sm border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-fadeIn">
                  <div>
                    <label className="block text-white/60 mb-1 text-[10px] uppercase tracking-wider">
                      CPF ou CNPJ do Cliente
                    </label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={clientDocument}
                      onChange={(e) => setClientDocument(e.target.value)}
                      className="w-full bg-[#111111] border border-white/15 rounded-sm px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1 text-[10px] uppercase tracking-wider">
                      E-mail do Cliente
                    </label>
                    <input
                      type="email"
                      placeholder="cliente@exemplo.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full bg-[#111111] border border-white/15 rounded-sm px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1 text-[10px] uppercase tracking-wider">
                      Número do Processo (CNJ)
                    </label>
                    <input
                      type="text"
                      placeholder="0001234-56.2024.8.26.0100"
                      value={processNumber}
                      onChange={(e) => setProcessNumber(e.target.value)}
                      className="w-full bg-[#111111] border border-white/15 rounded-sm px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1 text-[10px] uppercase tracking-wider">
                      Vara / Tribunal / Foro
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 2ª Vara Cível da Comarca"
                      value={courtOrVara}
                      onChange={(e) => setCourtOrVara(e.target.value)}
                      className="w-full bg-[#111111] border border-white/15 rounded-sm px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1 text-[10px] uppercase tracking-wider">
                      Parte Contrária / Adversa
                    </label>
                    <input
                      type="text"
                      placeholder="Nome do réu ou autor adverso"
                      value={opponentName}
                      onChange={(e) => setOpponentName(e.target.value)}
                      className="w-full bg-[#111111] border border-white/15 rounded-sm px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1 text-[10px] uppercase tracking-wider">
                      Fase do Processo
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-[#111111] border border-white/15 rounded-sm px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                    >
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Fase Inicial">Fase Inicial</option>
                      <option value="Instrução">Instrução</option>
                      <option value="Julgamento">Julgamento</option>
                      <option value="Recurso">Recurso</option>
                      <option value="Concluído">Concluído</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* BOTÕES DE AÇÃO INTEGRADOS COM EXPORTAÇÃO DE CONTRATO */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-xs uppercase tracking-wider transition-colors order-4 sm:order-1"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-[#111111] hover:bg-[#1a1a1a] border border-[#C5A059]/40 text-[#C5A059] font-bold text-xs uppercase tracking-wider transition-all order-3 sm:order-2"
              >
                Salvar
              </button>

              <button
                type="button"
                onClick={() => handleSaveCase('exportPdf')}
                className="w-full sm:w-auto px-4 py-2 bg-[#111111] hover:bg-[#1f1f1f] border border-[#C5A059] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 order-2 sm:order-3 shadow-sm"
              >
                <FileDown size={14} className="text-[#C5A059]" />
                <span>Salvar & Gerar Contrato (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveCase('consultAi')}
                className="w-full sm:w-auto px-5 py-2 bg-[#C5A059] hover:bg-[#D4B069] text-black font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-1.5 order-1 sm:order-4"
              >
                <Sparkles size={14} />
                <span>Salvar & Ver Defesa (IA)</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-NAVIGATION & SEARCH ROW */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0a0a0a] p-2.5 rounded-sm border border-white/10">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveSubTab('cases')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeSubTab === 'cases'
                ? 'bg-[#C5A059] text-black shadow-sm'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Scale size={13} />
            <span>Processos & Clientes ({cases.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('agenda')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeSubTab === 'agenda'
                ? 'bg-[#C5A059] text-black shadow-sm'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Calendar size={13} />
            <span>Agenda & Tarefas ({pendingTasks} pendentes)</span>
          </button>
        </div>

        {activeSubTab === 'cases' ? (
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search size={13} className="absolute left-2.5 top-2.5 text-white/40" />
              <input
                type="text"
                placeholder="Buscar cliente ou processo..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-sm pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
              />
            </div>
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="bg-[#111111] border border-white/10 rounded-sm px-2.5 py-1.5 text-xs text-white/80 focus:outline-none focus:border-[#C5A059]"
            >
              <option value="Todas">Todas as Áreas</option>
              <option value="Direito Cível">Direito Cível</option>
              <option value="Direito Penal / Criminalista">Direito Penal</option>
              <option value="Direito do Trabalho">Direito do Trabalho</option>
              <option value="Direito de Família e Sucessões">Direito de Família</option>
              <option value="Direito do Consumidor">Direito do Consumidor</option>
            </select>
          </div>
        ) : null}
      </div>

      {/* SUB-VIEW 1: CASES & CLIENTS LIST */}
      {activeSubTab === 'cases' && (
        <div className="space-y-3">
          {filteredCases.length === 0 ? (
            <div className="text-center py-12 px-4 bg-[#0a0a0a] border border-white/10 rounded-sm space-y-3">
              <div className="w-12 h-12 mx-auto rounded-none bg-white/5 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
                <Scale size={24} />
              </div>
              <h3 className="text-sm font-bold text-white uppercase font-['Cinzel',serif] tracking-wider">
                Nenhum caso ou cliente registrado
              </h3>
              <p className="text-xs text-white/50 max-w-sm mx-auto">
                {searchFilter
                  ? 'Nenhum resultado encontrado para a pesquisa.'
                  : 'Comece clicando no botão "+ Novo Cliente & Causa" acima para cadastrar em poucos segundos.'}
              </p>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-2 px-4 py-2 bg-[#C5A059] hover:bg-[#D4B069] text-black font-bold uppercase text-[11px] tracking-wider"
                >
                  + Cadastrar Primeiro Caso
                </button>
              )}
            </div>
          ) : (
            filteredCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="bg-[#0a0a0a] border border-white/10 hover:border-[#C5A059]/40 rounded-sm p-4 transition-all space-y-3 shadow-md group"
              >
                {/* Card Header: Client & Lawsuit Info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-white/5 pb-2.5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 text-[10px] font-bold uppercase tracking-wider">
                        {caseItem.specialty}
                      </span>
                      <span className="text-[10px] text-white/40 uppercase font-mono">
                        {caseItem.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-serif font-bold text-white tracking-wide group-hover:text-[#C5A059] transition-colors">
                      {caseItem.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/70 pt-0.5">
                      <span className="flex items-center gap-1 font-medium text-white">
                        <User size={12} className="text-[#C5A059]" /> {caseItem.clientName}
                      </span>

                      {caseItem.budgetAmount && (
                        <span className="flex items-center gap-1 text-[#DFB86C] font-semibold bg-[#111111] px-2 py-0.5 border border-white/5 rounded-sm text-[11px]">
                          <DollarSign size={11} /> {caseItem.budgetAmount}
                        </span>
                      )}

                      {caseItem.processNumber && (
                        <span className="text-[11px] text-[#C5A059] font-mono">
                          CNJ: {caseItem.processNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions on top right: WhatsApp & PDF Direct */}
                  <div className="flex items-center gap-1.5 self-start">
                    <button
                      type="button"
                      onClick={() => {
                        ContractPdfGenerator.downloadContractPdf(caseItem, profile);
                        setPdfSuccessMessage(`Contrato em PDF baixado para ${caseItem.clientName}!`);
                        setTimeout(() => setPdfSuccessMessage(null), 4000);
                      }}
                      className="px-2.5 py-1 bg-[#111111] hover:bg-[#1a1a1a] border border-[#C5A059]/50 text-[#C5A059] hover:text-[#DFB86C] text-[10px] font-bold uppercase rounded-sm flex items-center gap-1 transition-all"
                      title="Baixar Contrato de Honorários em PDF"
                    >
                      <FileDown size={12} />
                      <span>Contrato (PDF)</span>
                    </button>

                    {caseItem.clientPhone && (
                      <a
                        href={`https://wa.me/55${caseItem.clientPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-green-950/40 hover:bg-green-900/60 border border-green-500/40 text-green-300 text-[10px] uppercase font-bold rounded-sm flex items-center gap-1 transition-colors"
                        title="Conversar no WhatsApp"
                      >
                        <MessageCircle size={12} />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Facts excerpt */}
                <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                  {caseItem.facts}
                </p>

                {/* Card Footer: AI Strategy & Management Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setModalCase(caseItem)}
                    className="px-3.5 py-1.5 bg-[#C5A059] hover:bg-[#D4B069] text-black font-bold uppercase tracking-widest text-[10px] transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Sparkles size={12} />
                    <span>
                      {caseItem.lastAiStrategy ? 'Ver / Atualizar Defesa (IA)' : 'Consultar Formas de Defesa (IA)'}
                    </span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(caseItem)}
                      className="p-1.5 text-white/50 hover:text-white hover:bg-white/5 rounded-sm transition-colors text-xs flex items-center gap-1"
                      title="Editar Caso"
                    >
                      <Edit3 size={13} />
                      <span className="hidden sm:inline text-[10px] uppercase">Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCase(caseItem.id, caseItem.title, caseItem.clientName)}
                      className="p-1.5 text-red-400/60 hover:text-red-300 hover:bg-red-950/30 rounded-sm transition-colors text-xs flex items-center gap-1"
                      title="Excluir Caso"
                    >
                      <Trash2 size={13} />
                      <span className="hidden sm:inline text-[10px] uppercase">Excluir</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUB-VIEW 2: INTEGRATED AGENDA & TASKS */}
      {activeSubTab === 'agenda' && (
        <div className="space-y-4">
          {/* Quick Task Creation Form */}
          <form onSubmit={handleAddQuickTask} className="bg-[#0a0a0a] p-4 rounded-sm border border-white/10 space-y-3 shadow-md">
            <h4 className="text-[10px] uppercase text-[#C5A059] font-bold tracking-widest flex items-center gap-1.5">
              <Calendar size={13} /> Cadastrar Nova Tarefa / Prazo
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Descreva a tarefa jurídica, prazo ou audiência..."
                  value={quickTaskTitle}
                  onChange={(e) => setQuickTaskTitle(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <input
                  type="date"
                  value={quickTaskDueDate}
                  onChange={(e) => setQuickTaskDueDate(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-sm px-2 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="sm:col-span-2">
                <select
                  value={quickTaskCaseId}
                  onChange={(e) => setQuickTaskCaseId(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-sm px-2.5 py-1.5 text-xs text-white/80 focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="">Vincular a um cliente/caso (opcional)</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      ⚖️ {c.title} — {c.clientName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={!quickTaskTitle.trim()}
                  className="w-full py-2 bg-[#C5A059] hover:bg-[#D4B069] disabled:opacity-40 text-black font-bold uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-1"
                >
                  <Plus size={14} />
                  <span>Adicionar Tarefa</span>
                </button>
              </div>
            </div>
          </form>

          {/* Task list items */}
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <div className="text-center py-10 px-4 bg-[#0a0a0a] border border-white/10 rounded-sm text-white/40 text-xs">
                Nenhuma tarefa registrada na agenda.
              </div>
            ) : (
              tasks.map((task) => {
                const linkedCase = task.caseId ? cases.find((c) => c.id === task.caseId) : null;

                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 rounded-sm border transition-all ${
                      task.completed
                        ? 'bg-black/60 border-white/5 opacity-60'
                        : 'bg-[#0a0a0a] border-white/10 hover:border-[#C5A059]/40'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id)}
                        className={`mt-0.5 w-4 h-4 rounded-none flex items-center justify-center transition-all flex-shrink-0 ${
                          task.completed
                            ? 'bg-[#C5A059] text-black border border-[#C5A059]'
                            : 'bg-black/50 border border-white/30 hover:border-[#C5A059]'
                        }`}
                      >
                        {task.completed && (
                          <svg className="w-3 h-3 text-black font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs sm:text-sm leading-snug break-words ${
                            task.completed ? 'line-through text-white/40' : 'text-white/90 font-normal'
                          }`}
                        >
                          {task.title}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {linkedCase && (
                            <button
                              type="button"
                              onClick={() => setModalCase(linkedCase)}
                              className="px-2 py-0.5 rounded-none bg-[#C5A059]/15 text-[#DFB86C] text-[10px] font-medium border border-[#C5A059]/40 hover:bg-[#C5A059]/25 transition-colors flex items-center gap-1"
                            >
                              <Scale size={10} />
                              <span className="truncate max-w-[140px]">{linkedCase.title} ({linkedCase.clientName})</span>
                            </button>
                          )}

                          {task.dueDate && (
                            <span className="px-2 py-0.5 rounded-none bg-black/60 text-white/70 text-[10px] flex items-center gap-1 border border-white/10 font-mono">
                              <Calendar size={10} className="text-[#C5A059]" />
                              <span>{task.dueDate.split('-').reverse().join('/')}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-white/30 hover:text-red-400 p-1.5 rounded hover:bg-white/5 transition-colors flex-shrink-0"
                    >
                      <X size={15} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Case AI Defense Modal */}
      {activeModalCase && (
        <CaseDetailsModal
          legalCase={activeModalCase}
          profile={profile}
          isOpen={true}
          onClose={() => setModalCase(null)}
          onUpdateCase={handleUpdateCase}
          onAddTasksFromChecklist={onAddTasksFromChecklist}
        />
      )}
    </div>
  );
};
