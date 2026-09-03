import React, { useState } from 'react';
import { LegalCase, LawyerProfile, Task } from '../types';
import { Scale, Plus, Sparkles, Trash2, Edit3, User, Phone, MessageCircle, FileText, Search, ShieldCheck, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { CaseDetailsModal } from './CaseDetailsModal';

interface CasesViewProps {
  cases: LegalCase[];
  setCases: React.Dispatch<React.SetStateAction<LegalCase[]>>;
  profile: LawyerProfile;
  onAddTasksFromChecklist?: (tasks: Partial<Task>[]) => void;
  selectedCaseForModal?: LegalCase | null;
  setSelectedCaseForModal?: (c: LegalCase | null) => void;
}

export const CasesView: React.FC<CasesViewProps> = ({
  cases,
  setCases,
  profile,
  onAddTasksFromChecklist,
  selectedCaseForModal: externalSelectedCase,
  setSelectedCaseForModal: externalSetSelectedCase,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [internalSelectedCase, setInternalSelectedCase] = useState<LegalCase | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('Todas');

  const activeModalCase = externalSelectedCase !== undefined ? externalSelectedCase : internalSelectedCase;
  const setModalCase = (c: LegalCase | null) => {
    if (externalSetSelectedCase) externalSetSelectedCase(c);
    setInternalSelectedCase(c);
  };

  // Form states - Unified Client & Lawsuit
  const [clientName, setClientName] = useState('');
  const [clientType, setClientType] = useState<'Pessoa Física' | 'Pessoa Jurídica'>('Pessoa Física');
  const [clientDocument, setClientDocument] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  const [title, setTitle] = useState('');
  const [processNumber, setProcessNumber] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const [courtOrVara, setCourtOrVara] = useState('');
  const [specialty, setSpecialty] = useState(profile.specialty || 'Direito Cível');
  const [facts, setFacts] = useState('');
  const [objectives, setObjectives] = useState('');
  const [circumstances, setCircumstances] = useState('');
  const [status, setStatus] = useState<LegalCase['status']>('Em Andamento');

  const resetForm = () => {
    setClientName('');
    setClientType('Pessoa Física');
    setClientDocument('');
    setClientPhone('');
    setClientEmail('');
    setClientNotes('');
    setTitle('');
    setProcessNumber('');
    setOpponentName('');
    setCourtOrVara('');
    setSpecialty(profile.specialty || 'Direito Cível');
    setFacts('');
    setObjectives('');
    setCircumstances('');
    setStatus('Em Andamento');
    setEditingCaseId(null);
    setShowAddForm(false);
  };

  const handleStartEdit = (caseItem: LegalCase) => {
    setEditingCaseId(caseItem.id);
    setClientName(caseItem.clientName || '');
    setClientType(caseItem.clientType || 'Pessoa Física');
    setClientDocument(caseItem.clientDocument || '');
    setClientPhone(caseItem.clientPhone || '');
    setClientEmail(caseItem.clientEmail || '');
    setClientNotes(caseItem.clientNotes || '');
    setTitle(caseItem.title || '');
    setProcessNumber(caseItem.processNumber || '');
    setOpponentName(caseItem.opponentName || '');
    setCourtOrVara(caseItem.courtOrVara || '');
    setSpecialty(caseItem.specialty || profile.specialty || 'Direito Cível');
    setFacts(caseItem.facts || '');
    setObjectives(caseItem.objectives || '');
    setCircumstances(caseItem.circumstances || '');
    setStatus(caseItem.status || 'Em Andamento');
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCase = (andConsultAi: boolean) => {
    if (!clientName.trim() || !title.trim() || !facts.trim()) {
      alert('Por favor, preencha os campos obrigatórios: Nome do Cliente, Título da Causa e Descrição dos Fatos.');
      return;
    }

    let targetCase: LegalCase;

    if (editingCaseId) {
      targetCase = {
        ...cases.find((c) => c.id === editingCaseId)!,
        clientName: clientName.trim(),
        clientType,
        clientDocument: clientDocument.trim() || undefined,
        clientPhone: clientPhone.trim() || undefined,
        clientEmail: clientEmail.trim() || undefined,
        clientNotes: clientNotes.trim() || undefined,
        title: title.trim(),
        processNumber: processNumber.trim() || undefined,
        opponentName: opponentName.trim() || undefined,
        courtOrVara: courtOrVara.trim() || undefined,
        specialty: specialty.trim() || profile.specialty || 'Geral',
        facts: facts.trim(),
        objectives: objectives.trim() || 'Defesa técnica e resguardo de direitos',
        circumstances: circumstances.trim() || undefined,
        status,
        updatedAt: new Date().toISOString(),
      };

      setCases((prev) => prev.map((c) => (c.id === editingCaseId ? targetCase : c)));
    } else {
      targetCase = {
        id: 'case_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        clientName: clientName.trim(),
        clientType,
        clientDocument: clientDocument.trim() || undefined,
        clientPhone: clientPhone.trim() || undefined,
        clientEmail: clientEmail.trim() || undefined,
        clientNotes: clientNotes.trim() || undefined,
        title: title.trim(),
        processNumber: processNumber.trim() || undefined,
        opponentName: opponentName.trim() || undefined,
        courtOrVara: courtOrVara.trim() || undefined,
        specialty: specialty.trim() || profile.specialty || 'Geral',
        facts: facts.trim(),
        objectives: objectives.trim() || 'Defesa técnica e resguardo de direitos',
        circumstances: circumstances.trim() || undefined,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCases((prev) => [targetCase, ...prev]);
    }

    resetForm();

    if (andConsultAi) {
      setModalCase(targetCase);
    }
  };

  const handleDeleteCase = (caseId: string, caseTitle: string, clientName: string) => {
    if (window.confirm(`Deseja excluir o registro da causa "${caseTitle}" (Cliente: ${clientName})?`)) {
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

  // Filtered cases
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.clientName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (c.processNumber && c.processNumber.includes(searchFilter)) ||
      (c.courtOrVara && c.courtOrVara.toLowerCase().includes(searchFilter.toLowerCase()));

    const matchesSpecialty = specialtyFilter === 'Todas' || c.specialty === specialtyFilter;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5 pb-12">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 pt-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif text-white flex items-center gap-2 font-['Cinzel',serif] tracking-wider">
            <span className="w-1.5 h-5 bg-[#16a34a] inline-block"></span>
            Clientes & Causas
          </h2>
          <p className="text-white/50 text-xs mt-0.5">
            Cadastre o cliente e a causa conjuntamente e consulte teses de defesa e leis com IA.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showAddForm) resetForm();
            else setShowAddForm(true);
          }}
          className="bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs uppercase py-2.5 px-4 tracking-widest transition-all shadow-sm flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>{showAddForm ? 'Fechar Formulário' : '+ Cadastrar Cliente & Causa'}</span>
        </button>
      </div>

      {/* UNIFIED CLIENT & LAWSUIT REGISTRATION FORM */}
      {showAddForm && (
        <div className="bg-[#0a0a0a] p-4 sm:p-6 rounded-sm border border-[#C5A059]/40 shadow-2xl space-y-5 transition-all">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest font-['Cinzel',serif] flex items-center gap-2 text-[#C5A059]">
                <Scale size={15} className="text-[#C5A059]" />
                {editingCaseId ? 'Editar Cliente & Causa' : 'Cadastro Integrado: Cliente & Causa'}
              </h3>
              <p className="text-[11px] text-white/50 mt-0.5">
                Preencha os dados do cliente e os fatos da causa para obter a análise estratégica de defesa.
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
              handleSaveCase(false);
            }}
            className="space-y-5"
          >
            {/* SEÇÃO 1: DADOS DO CLIENTE / ASSISTIDO */}
            <div className="space-y-3 bg-[#0f0f0f] p-4 rounded-sm border border-white/10">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h4 className="text-[11px] font-bold text-[#C5A059] uppercase tracking-wider flex items-center gap-1.5">
                  <User size={13} /> 1. Dados do Cliente / Assistido
                </h4>
                <div className="flex items-center gap-2 text-xs">
                  <label className="flex items-center gap-1 text-[11px] text-white/70 cursor-pointer">
                    <input
                      type="radio"
                      name="clientType"
                      value="Pessoa Física"
                      checked={clientType === 'Pessoa Física'}
                      onChange={() => setClientType('Pessoa Física')}
                      className="text-[#C5A059]"
                    />
                    Pessoa Física (PF)
                  </label>
                  <label className="flex items-center gap-1 text-[11px] text-white/70 cursor-pointer">
                    <input
                      type="radio"
                      name="clientType"
                      value="Pessoa Jurídica"
                      checked={clientType === 'Pessoa Jurídica'}
                      onChange={() => setClientType('Pessoa Jurídica')}
                      className="text-[#C5A059]"
                    />
                    Pessoa Jurídica (PJ)
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-white/70 font-medium mb-1 text-[10px] uppercase tracking-wider">
                    Nome do Cliente / Razão Social <span className="text-[#C5A059]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva ou Empresa XYZ Ltda."
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-medium mb-1 text-[10px] uppercase tracking-wider">
                    CPF ou CNPJ
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 000.000.000-00 ou 00.000.000/0001-00"
                    value={clientDocument}
                    onChange={(e) => setClientDocument(e.target.value)}
                    className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-medium mb-1 text-[10px] uppercase tracking-wider">
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
                  <label className="block text-white/70 font-medium mb-1 text-[10px] uppercase tracking-wider">
                    E-mail do Cliente
                  </label>
                  <input
                    type="email"
                    placeholder="cliente@exemplo.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-white/70 font-medium mb-1 text-[10px] uppercase tracking-wider">
                    Observações sobre o Cliente (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Cliente idoso; indicação do Dr. Carlos; preferência de contato à tarde..."
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: DADOS DA CAUSA / PROCESSO */}
            <div className="space-y-3 bg-[#0f0f0f] p-4 rounded-sm border border-white/10">
              <div className="border-b border-white/5 pb-2">
                <h4 className="text-[11px] font-bold text-[#C5A059] uppercase tracking-wider flex items-center gap-1.5">
                  <Scale size={13} /> 2. Dados da Causa & Fatos Processuais
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-white/70 font-medium mb-1 text-[10px] uppercase tracking-wider">
                    Título / Identificação da Causa <span className="text-[#C5A059]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ação de Indenização por Danos Morais ou Defesa Prévia Criminal"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#111111] border border-white/15 rounded-sm px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-medium mb-1 text-[10px] uppercase tracking-wider">
                    Ramo do Direito / Área
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

                <div>
                  <label className="block text-white/70 font-medium mb-1 text-[10px] uppercase tracking-wider">
                    Número do Processo (CNJ)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 0001234-56.2024.8.26.0100"
                    value={processNumber}
                    onChange={(e) => setProcessNumber(e.target.value)}
                    className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-medium mb-1 text-[10px] uppercase tracking-wider">
                    Parte Contrária / Adversa
                  </label>
                  <input
                    type="text"
                    placeholder="Nome do réu ou autor oposto"
                    value={opponentName}
                    onChange={(e) => setOpponentName(e.target.value)}
                    className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-medium mb-1 text-[10px] uppercase tracking-wider">
                    Vara / Tribunal / Foro
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 2ª Vara Cível de SP"
                    value={courtOrVara}
                    onChange={(e) => setCourtOrVara(e.target.value)}
                    className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-white/70 font-medium mb-1 text-[10px] uppercase tracking-wider">
                    Fatos e Circunstâncias da Causa <span className="text-[#C5A059]">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Descreva o que ocorreu, os argumentos apresentados e as provas existentes..."
                    value={facts}
                    onChange={(e) => setFacts(e.target.value)}
                    className="w-full bg-[#111111] border border-white/15 rounded-sm p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-white/70 font-medium mb-1 text-[10px] uppercase tracking-wider">
                    Pedidos / Objetivos Almejados (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Absolvição sumária, improcedência dos pedidos, redução de indenização, tutela liminar..."
                    value={objectives}
                    onChange={(e) => setObjectives(e.target.value)}
                    className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-white/70 font-medium mb-1 text-[10px] uppercase tracking-wider">
                    Novas Circunstâncias / Observações Dinâmicas (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Documento novo localizado, testemunha confirmou álibi, decisão interlocutória..."
                    value={circumstances}
                    onChange={(e) => setCircumstances(e.target.value)}
                    className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-medium mb-1 text-[10px] uppercase tracking-wider">
                    Fase / Status do Processo
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
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
            </div>

            {/* BOTÕES DE AÇÃO INTEGRADOS */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 text-xs uppercase tracking-wider transition-colors order-3 sm:order-1"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-[#111111] hover:bg-[#1a1a1a] border border-[#C5A059]/40 text-[#C5A059] font-bold text-xs uppercase tracking-wider transition-all order-2"
              >
                {editingCaseId ? 'Salvar Alterações' : 'Salvar Cliente & Causa'}
              </button>

              <button
                type="button"
                onClick={() => handleSaveCase(true)}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-1.5 order-1 sm:order-3"
              >
                <Sparkles size={14} />
                <span>Salvar & Consultar Defesa (IA)</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3 top-3 text-white/40" />
          <input
            type="text"
            placeholder="Pesquisar por cliente, causa, processo ou vara..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-sm pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
          />
        </div>

        <select
          value={specialtyFilter}
          onChange={(e) => setSpecialtyFilter(e.target.value)}
          className="w-full sm:w-auto bg-[#0a0a0a] border border-white/10 rounded-sm px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-[#C5A059]"
        >
          <option value="Todas">Todas as Áreas</option>
          <option value="Direito Cível">Direito Cível</option>
          <option value="Direito Penal / Criminalista">Direito Penal</option>
          <option value="Direito do Trabalho">Direito do Trabalho</option>
          <option value="Direito de Família e Sucessões">Direito de Família</option>
          <option value="Direito do Consumidor">Direito do Consumidor</option>
          <option value="Direito Tributário">Direito Tributário</option>
          <option value="Direito Previdenciário">Direito Previdenciário</option>
          <option value="Direito Empresarial">Direito Empresarial</option>
        </select>
      </div>

      {/* CASES AND CLIENTS LIST */}
      {filteredCases.length === 0 ? (
        <div className="text-center py-12 px-4 bg-[#0a0a0a] border border-white/10 rounded-sm space-y-3">
          <div className="w-12 h-12 mx-auto rounded-none bg-white/5 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
            <Scale size={24} />
          </div>
          <h3 className="text-sm font-bold text-white uppercase font-['Cinzel',serif] tracking-wider">
            Nenhum registro encontrado
          </h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            {searchFilter
              ? 'Nenhum cliente ou causa corresponde à busca realizada.'
              : 'Seu escritório está 100% pronto. Clique em "+ Cadastrar Cliente & Causa" para iniciar.'}
          </p>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold uppercase text-[11px] tracking-wider"
            >
              + Cadastrar Primeiro Caso
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="bg-[#0a0a0a] border border-white/10 hover:border-[#C5A059]/40 rounded-sm p-4 transition-all space-y-3 shadow-md group"
            >
              {/* Card Header: Client & Lawsuit Info */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-white/5 pb-2.5">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#16a34a]/20 text-[#C5A059] border border-[#C5A059]/40 text-[10px] font-bold uppercase tracking-wider">
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
                    {caseItem.clientDocument && (
                      <span className="text-[11px] text-white/40 font-mono">
                        Doc: {caseItem.clientDocument}
                      </span>
                    )}
                    {caseItem.processNumber && (
                      <span className="text-[11px] text-[#C5A059] font-mono">
                        CNJ: {caseItem.processNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Client Action (WhatsApp) */}
                {caseItem.clientPhone && (
                  <a
                    href={`https://wa.me/55${caseItem.clientPhone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start px-2.5 py-1 bg-green-950/40 hover:bg-green-900/60 border border-green-500/40 text-green-300 text-[10px] uppercase font-bold rounded-sm flex items-center gap-1 transition-colors"
                    title="Conversar no WhatsApp"
                  >
                    <MessageCircle size={12} />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>

              {/* Facts excerpt */}
              <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                {caseItem.facts}
              </p>

              {/* Card Footer: AI Strategy Consultation & Management */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setModalCase(caseItem)}
                  className="px-3.5 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold uppercase tracking-widest text-[10px] transition-all shadow-sm flex items-center gap-1.5"
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
                    className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-sm transition-colors text-xs flex items-center gap-1"
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
          ))}
        </div>
      )}

      {/* AI Strategy & Defense Modal */}
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
