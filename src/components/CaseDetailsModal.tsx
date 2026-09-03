import React, { useState } from 'react';
import { LegalCase, LawyerProfile, Task } from '../types';
import { LegalAiEngine, buildGoogleLegalSearchUrls } from '../services/legalAiEngine';
import { ContractPdfGenerator } from '../services/contractPdfGenerator';
import {
  Scale,
  Sparkles,
  BookOpen,
  ShieldAlert,
  CheckSquare,
  PlusCircle,
  MessageSquare,
  Send,
  RefreshCw,
  X,
  AlertTriangle,
  ExternalLink,
  Search,
  Copy,
  Check,
  FileDown,
  CheckCircle2,
  Clock,
  DollarSign
} from 'lucide-react';

interface CaseDetailsModalProps {
  legalCase: LegalCase;
  profile: LawyerProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCase: (updatedCase: LegalCase) => void;
  onAddTasksFromChecklist?: (tasks: Partial<Task>[]) => void;
}

export const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({
  legalCase,
  profile,
  isOpen,
  onClose,
  onUpdateCase,
  onAddTasksFromChecklist,
}) => {
  const [loadingStrategy, setLoadingStrategy] = useState(false);
  const [newCircumstance, setNewCircumstance] = useState('');
  const [justSavedCircumstance, setJustSavedCircumstance] = useState(false);
  const [consultQuestion, setConsultQuestion] = useState('');
  const [consultLoading, setConsultLoading] = useState(false);
  const [consultHistory, setConsultHistory] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const strategy = legalCase.lastAiStrategy;
  const googleSearchLinks = buildGoogleLegalSearchUrls(legalCase);

  // Generate or Regenerate Legal Strategy with dynamic circumstance
  const handleGenerateStrategy = async (customCircumstances?: string) => {
    setLoadingStrategy(true);
    setJustSavedCircumstance(false);

    try {
      const circumText = customCircumstances || newCircumstance.trim() || legalCase.circumstances;
      const strategyResult = await LegalAiEngine.generateStrategy(legalCase, profile, circumText);

      // Build updated circumstances history
      const newHistory = [...(legalCase.circumstancesHistory || [])];
      if (customCircumstances?.trim()) {
        newHistory.unshift({
          text: customCircumstances.trim(),
          addedAt: new Date().toISOString(),
        });
      }

      const updatedCircumstances = customCircumstances
        ? (legalCase.circumstances ? legalCase.circumstances + '\n• ' : '• ') + customCircumstances.trim()
        : legalCase.circumstances;

      const updated: LegalCase = {
        ...legalCase,
        lastAiStrategy: strategyResult,
        circumstances: updatedCircumstances,
        circumstancesHistory: newHistory,
        updatedAt: new Date().toISOString(),
      };

      onUpdateCase(updated);
      setNewCircumstance('');
      setJustSavedCircumstance(true);
      setTimeout(() => setJustSavedCircumstance(false), 4000);
    } catch (err: any) {
      alert(`Aviso: ${err.message || 'Erro ao processar estratégia.'}`);
    } finally {
      setLoadingStrategy(false);
    }
  };

  // Submit quick consultation question regarding this case
  const handleSendConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = consultQuestion.trim();
    if (!q || consultLoading) return;

    setConsultHistory((prev) => [...prev, { sender: 'user', text: q }]);
    setConsultQuestion('');
    setConsultLoading(true);

    try {
      const answer = await LegalAiEngine.askLegalAdvice(legalCase, profile, q);
      setConsultHistory((prev) => [...prev, { sender: 'ai', text: answer }]);
    } catch (err: any) {
      setConsultHistory((prev) => [
        ...prev,
        { sender: 'ai', text: `Resposta consultiva: observe os prazos do ${legalCase.specialty} e instrua o cliente com provas documentais.` },
      ]);
    } finally {
      setConsultLoading(false);
    }
  };

  // Import recommended actions into agenda tasks
  const handleImportChecklistToAgenda = () => {
    if (!strategy?.actionChecklist || !onAddTasksFromChecklist) return;

    const newTasks: Partial<Task>[] = strategy.actionChecklist.map((actionItem) => ({
      title: actionItem,
      category: 'Prazos / Peças',
      priority: 'alta',
      caseId: legalCase.id,
      completed: false,
    }));

    onAddTasksFromChecklist(newTasks);
    alert(`${newTasks.length} tarefas e prazos recomendados foram adicionados à sua Agenda com sucesso!`);
  };

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleDownloadPdfContract = () => {
    try {
      ContractPdfGenerator.downloadContractPdf(legalCase, profile);
    } catch (e: any) {
      alert('Erro ao gerar PDF: ' + (e.message || 'Tente novamente.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#0a0a0a] border border-[#C5A059]/40 w-full max-w-3xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[94vh] my-auto">
        {/* Header */}
        <div className="bg-[#0f0f0f] px-4 sm:px-6 py-3.5 border-b border-[#C5A059]/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-sm bg-[#111111] border border-[#C5A059]/40 text-[#C5A059]">
              <Scale size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-serif font-bold text-white font-['Cinzel',serif] tracking-wide flex items-center gap-2">
                {legalCase.title}
              </h3>
              <p className="text-xs text-white/50">
                Cliente: <span className="text-white font-medium">{legalCase.clientName}</span>
                {legalCase.processNumber && (
                  <span className="ml-2 font-mono text-[11px] text-[#C5A059]">
                    CNJ: {legalCase.processNumber}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdfContract}
              className="px-2.5 py-1.5 bg-[#C5A059] hover:bg-[#D4B069] text-black font-bold uppercase tracking-wider text-[10px] rounded-sm transition-all flex items-center gap-1 shadow-sm"
              title="Gerar e baixar contrato de honorários em PDF"
            >
              <FileDown size={13} />
              <span className="hidden sm:inline">Contrato (PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-sm text-white/90">
          {/* Summary Card of Case Facts & Client */}
          <div className="bg-[#050505] rounded-sm p-4 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
              <h4 className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold flex items-center gap-1.5">
                <span>📋</span> Fatos & Detalhes da Causa
              </h4>
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-mono">
                Área: {legalCase.specialty}
              </span>
            </div>
            
            <p className="text-xs text-white/80 whitespace-pre-wrap leading-relaxed pt-1">
              {legalCase.facts}
            </p>

            {/* Budget / Honorários preview */}
            {legalCase.budgetAmount && (
              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#C5A059] font-bold flex items-center gap-1 text-[11px]">
                  <DollarSign size={13} /> Honorários:
                </span>
                <span className="text-white font-semibold">{legalCase.budgetAmount}</span>
                {legalCase.paymentMethod && (
                  <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-white/70 text-[10px] uppercase">
                    {legalCase.paymentMethod}
                  </span>
                )}
                {legalCase.installmentsCount && (
                  <span className="text-[11px] text-white/50">
                    ({legalCase.installmentsCount}x {legalCase.installmentValue ? `de ${legalCase.installmentValue}` : ''})
                  </span>
                )}
              </div>
            )}

            {legalCase.objectives && (
              <div className="mt-1 pt-1.5 border-t border-white/5 text-xs">
                <span className="text-white/40 font-medium uppercase text-[10px] tracking-wider">Objetivos: </span>
                <span className="text-white/90">{legalCase.objectives}</span>
              </div>
            )}
            
            {legalCase.courtOrVara && (
              <div className="mt-1 text-xs text-white/50">
                <span className="font-medium uppercase text-[10px] tracking-wider">Vara / Tribunal: </span>
                <span className="text-white/80">{legalCase.courtOrVara}</span>
              </div>
            )}
          </div>

          {/* DYNAMIC CIRCUMSTANCES FIELD & HISTORY */}
          <div className="bg-[#050505] border border-[#C5A059]/30 rounded-sm p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] flex items-center gap-1.5">
                <span>📝</span> Novas Circunstâncias & Fatos Dinâmicos
              </h4>
              <span className="text-[10px] text-white/40 font-mono">
                {legalCase.circumstancesHistory?.length || (legalCase.circumstances ? 1 : 0)} fato(s) registrado(s)
              </span>
            </div>

            <p className="text-xs text-white/60 leading-relaxed">
              Adicione novos fatos, documentos, testemunhas ou decisões no processo. A tese jurídica e dicas são recalculadas instantaneamente.
            </p>

            {/* Success toast after saving */}
            {justSavedCircumstance && (
              <div className="p-2.5 bg-green-950/40 border border-green-500/40 text-green-300 text-xs rounded-sm flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 size={15} className="text-green-400 flex-shrink-0" />
                <span>Circunstância registrada com sucesso! Estratégia de defesa atualizada.</span>
              </div>
            )}

            {/* List of previously registered circumstances */}
            {((legalCase.circumstancesHistory && legalCase.circumstancesHistory.length > 0) || legalCase.circumstances) && (
              <div className="space-y-2 pt-1 pb-1">
                <span className="text-[9px] uppercase font-bold text-white/40 tracking-wider">
                  Histórico de Circunstâncias Cadastradas:
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {legalCase.circumstancesHistory && legalCase.circumstancesHistory.length > 0 ? (
                    legalCase.circumstancesHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-[#111111] p-2.5 rounded-none border-l-2 border-l-[#C5A059] border-y border-r border-white/5 text-xs text-white/90 space-y-1"
                      >
                        <p className="leading-snug">{item.text}</p>
                        <div className="text-[9px] text-white/40 font-mono flex items-center gap-1">
                          <Clock size={10} />
                          <span>Adicionado em: {new Date(item.addedAt).toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-[#111111] p-2.5 rounded-none border-l-2 border-l-[#C5A059] border-y border-r border-white/5 text-xs text-white/80">
                      {legalCase.circumstances}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add new circumstance input */}
            <div className="space-y-2 pt-1">
              <textarea
                rows={2}
                placeholder="Digite a nova circunstância (Ex: Juntada de novo comprovante bancário, testemunha confirmou depoimento, decisão liminar deferida...)"
                value={newCircumstance}
                onChange={(e) => setNewCircumstance(e.target.value)}
                className="w-full bg-[#111111] border border-white/15 rounded-sm p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!newCircumstance.trim() || loadingStrategy}
                  onClick={() => handleGenerateStrategy(newCircumstance.trim())}
                  className="px-4 py-2 bg-[#C5A059] hover:bg-[#D4B069] text-black font-bold uppercase tracking-wider text-xs transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-md"
                >
                  {loadingStrategy ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      <span>Salvar & Atualizar Estratégia</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* AI Strategy Generation Trigger or Strategy Results */}
          {!strategy ? (
            <div className="text-center py-8 px-4 bg-[#050505] rounded-sm border border-[#C5A059]/30 p-6 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-none bg-white/5 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
                <Sparkles size={22} />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="text-base font-serif font-bold text-white font-['Cinzel',serif] tracking-wider">
                  Consultar Formas de Defesa & Leis Aplicáveis com IA
                </h4>
                <p className="text-xs text-white/50 mt-1">
                  Gere imediatamente o enredo defensivo, dispositivos de lei aplicáveis (CPC, CP, CPP, CLT, CC, CDC, CF/88), dicas estratégicas e checklist prático.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleGenerateStrategy()}
                disabled={loadingStrategy}
                className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#D4B069] text-black font-bold uppercase tracking-widest text-xs transition-all shadow-md flex items-center justify-center gap-2 mx-auto disabled:opacity-40"
              >
                {loadingStrategy ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Analisando legislação e elaborando tese...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Gerar Estratégia de Defesa & Leis</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Personalized Lawyer Greeting & Executive Summary */}
              <div className="bg-[#050505] p-4 rounded-sm border border-[#C5A059]/40 shadow-sm flex items-start gap-3">
                <div className="text-xl">⚖️</div>
                <div className="flex-1">
                  <h4 className="text-xs font-serif font-bold text-[#C5A059] uppercase tracking-wider font-['Cinzel',serif]">
                    {strategy.lawyerGreeting}
                  </h4>
                  <p className="text-xs text-white/80 mt-1 leading-relaxed">
                    {strategy.summaryOfCase}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[10px] text-white/40 font-mono">
                    <span>Gerado em: {new Date(strategy.generatedAt).toLocaleString('pt-BR')}</span>
                    <span className="text-[#C5A059]">Motor Jurídico Ativo</span>
                  </div>
                </div>
              </div>

              {/* SECTION 1: Applicable Laws */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-white/5 pb-1">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] flex items-center gap-2">
                    <BookOpen size={14} /> Leis e Artigos Aplicáveis ao Caso
                  </h4>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider">
                    {strategy.applicableLaws.length} dispositivos identificados
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {strategy.applicableLaws.map((law, idx) => (
                    <div
                      key={idx}
                      className="bg-[#050505] border border-white/10 hover:border-[#C5A059]/40 rounded-sm p-3.5 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#C5A059] flex items-center gap-1.5 font-serif">
                          <span>📜</span> {law.codeOrLaw}
                        </span>
                      </div>
                      <p className="text-xs text-white/80">{law.articleDescription}</p>
                      <div className="bg-[#111111] p-2 rounded-none border border-white/5 text-[11px] text-white/70">
                        <strong className="text-[#C5A059]">Aplicação Estratégica: </strong>
                        {law.relevance}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 2: Defense Storyline & Theses */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-white/5 pb-1">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] flex items-center gap-2">
                    <Scale size={14} /> Enredo & Teses de Defesa Estruturadas
                  </h4>
                  <button
                    onClick={() => {
                      const fullText = strategy.defenseStoryline
                        .map((s) => `[${s.phase}] ${s.argumentTitle}\n${s.details}\n${s.jurisprudenceTip ? `Jurisprudência: ${s.jurisprudenceTip}` : ''}`)
                        .join('\n\n');
                      copyToClipboard(fullText, 'storyline');
                    }}
                    className="text-[10px] text-[#C5A059] hover:underline uppercase tracking-wider flex items-center gap-1"
                  >
                    {copiedSection === 'storyline' ? (
                      <>
                        <Check size={12} />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copiar Roteiro de Defesa</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-3">
                  {strategy.defenseStoryline.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#050505] border-l-2 border-l-[#C5A059] border-y border-r border-white/10 rounded-none p-4 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-white/5 text-[#C5A059] border border-[#C5A059]/30">
                          {item.phase}
                        </span>
                      </div>
                      <h5 className="text-xs font-serif font-bold text-white mt-1 tracking-wide">{item.argumentTitle}</h5>
                      <p className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap">
                        {item.details}
                      </p>
                      {item.jurisprudenceTip && (
                        <div className="mt-2 text-[11px] text-white/70 bg-[#111111] p-2 rounded-none border border-white/5 flex items-start gap-1.5">
                          <span className="text-[#C5A059]">💡</span>
                          <span>
                            <strong className="text-white/90">Jurisprudência / Precedente: </strong>
                            {item.jurisprudenceTip}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3: Strategic Tips & Tactical Advice */}
              <div className="bg-[#050505] border border-white/10 rounded-sm p-4 space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] flex items-center gap-2">
                  <span>💡</span> Dicas Estratégicas & Táticas para o Processo
                </h4>
                <ul className="space-y-2 text-xs text-white/80">
                  {strategy.strategicTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#C5A059] font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* SECTION 4: Risks and Critical Alerts */}
              {strategy.risksAndAlerts.length > 0 && (
                <div className="bg-red-950/20 border border-red-500/30 rounded-sm p-4 space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-400 flex items-center gap-2">
                    <ShieldAlert size={14} /> Alertas de Atenção & Riscos Processuais
                  </h4>
                  <ul className="space-y-1.5 text-xs text-white/80">
                    {strategy.risksAndAlerts.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertTriangle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* SECTION 5: Recommended Action Checklist & Import into Agenda */}
              <div className="bg-[#050505] border border-white/10 rounded-sm p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] flex items-center gap-2">
                    <CheckSquare size={14} /> Checklist de Ações Recomendadas
                  </h4>
                  {onAddTasksFromChecklist && (
                    <button
                      type="button"
                      onClick={handleImportChecklistToAgenda}
                      className="px-2.5 py-1 bg-[#C5A059] hover:bg-[#D4B069] text-black text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                    >
                      <PlusCircle size={13} />
                      <span>Adicionar à Minha Agenda</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  {strategy.actionChecklist.map((action, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-white/90 bg-[#111111] p-2.5 rounded-none border border-white/5"
                    >
                      <span className="w-4 h-4 rounded-none bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* GOOGLE LEGAL RESEARCH HELPER */}
              <div className="bg-[#050505] border border-white/10 rounded-sm p-4 space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] flex items-center gap-2">
                  <Search size={14} /> Pesquisa de Jurisprudência & Doutrina no Google
                </h4>
                <p className="text-xs text-white/50">
                  Consulte decisões atualizadas nos Tribunais Superiores e portais jurídicos para este caso com 1 clique:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {googleSearchLinks.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#111111] hover:bg-[#191919] border border-white/15 hover:border-[#C5A059]/50 text-xs text-white/80 hover:text-[#C5A059] rounded-sm transition-colors flex items-center gap-1.5"
                    >
                      <ExternalLink size={12} />
                      <span>{item.title}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Recalculate Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleGenerateStrategy()}
                  disabled={loadingStrategy}
                  className="px-4 py-2 bg-[#111111] hover:bg-[#191919] border border-[#C5A059]/40 text-[#DFB86C] text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={13} className={loadingStrategy ? 'animate-spin' : ''} />
                  <span>Recalcular Estratégia Jurídica</span>
                </button>
              </div>
            </div>
          )}

          {/* QUICK CONSULTATION CHAT */}
          <div className="bg-[#050505] border border-white/10 rounded-sm p-4 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] flex items-center gap-2">
              <MessageSquare size={14} /> Consultoria Jurídica Rápida para este Caso
            </h4>
            <p className="text-xs text-white/50">
              Tire dúvidas específicas sobre prazos, recursos cabíveis, perguntas para audiência ou jurisprudência.
            </p>

            {/* Chat History */}
            {consultHistory.length > 0 && (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {consultHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-none text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-white/10 border-l-2 border-white ml-6 text-white'
                        : 'bg-[#111111] border-l-2 border-[#C5A059] mr-6 text-white/90'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1 text-[#C5A059]">
                      {msg.sender === 'user' ? 'Sua Dúvida:' : 'Assistente Jurídico:'}
                    </div>
                    {msg.text}
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSendConsultation} className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Qual o prazo para impugnar o laudo pericial?"
                value={consultQuestion}
                onChange={(e) => setConsultQuestion(e.target.value)}
                className="flex-1 bg-[#111111] border border-white/15 rounded-sm px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
              />
              <button
                type="submit"
                disabled={!consultQuestion.trim() || consultLoading}
                className="px-4 py-2 bg-[#C5A059] hover:bg-[#D4B069] text-black font-bold uppercase text-xs transition-all disabled:opacity-40 flex items-center gap-1.5"
              >
                {consultLoading ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                <span>Enviar</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
