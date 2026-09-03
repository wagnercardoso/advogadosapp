import React from 'react';
import { Task, LegalCase } from '../types';
import { AlertTriangle, Calendar, Clock, CheckCircle, Scale, Plus } from 'lucide-react';

interface DeadlinesAlertsViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  cases: LegalCase[];
  onSelectCaseForStrategy?: (caseItem: LegalCase) => void;
  onGoToAgenda: () => void;
}

export const DeadlinesAlertsView: React.FC<DeadlinesAlertsViewProps> = ({
  tasks,
  setTasks,
  cases,
  onSelectCaseForStrategy,
  onGoToAgenda,
}) => {
  // Find tasks with due dates or urgent/high priority
  const alertTasks = tasks.filter((t) => !t.completed && (t.dueDate || t.priority === 'urgente' || t.priority === 'alta'));

  // Sort by date or urgency
  const sortedAlerts = [...alertTasks].sort((a, b) => {
    if (a.priority === 'urgente' && b.priority !== 'urgente') return -1;
    if (b.priority === 'urgente' && a.priority !== 'urgente') return 1;
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-none bg-white/5 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
            <Clock size={16} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-bold tracking-widest uppercase text-white font-['Cinzel',serif]">
              Prazos & Alertas
            </h2>
            <p className="text-[11px] text-white/50">
              Acompanhamento de prazos fatais, audiências e compromissos prioritários.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="bg-[#050505] border border-white/10 rounded-none p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-none bg-white/5 text-[#C5A059] border border-[#C5A059]/30">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-white">Alertas Ativos</h4>
            <p className="text-[11px] text-white/50">
              {sortedAlerts.length} {sortedAlerts.length === 1 ? 'prazo/alerta pendente' : 'prazos/alertas pendentes'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoToAgenda}
          className="px-3 py-1.5 bg-[#C5A059] hover:bg-[#D4B069] text-black text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
        >
          <Plus size={13} />
          <span>Novo Prazo</span>
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-2">
        {sortedAlerts.length === 0 ? (
          <div className="text-center py-12 px-4 bg-[#050505] rounded-none border border-white/10 text-white/40 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-none bg-white/5 border border-white/10 flex items-center justify-center text-[#C5A059]">
              <CheckCircle size={22} />
            </div>
            <div>
              <p className="text-xs font-serif font-bold uppercase tracking-wider text-white">
                Nenhum prazo urgente pendente
              </p>
              <p className="text-[11px] text-white/40 mt-1 max-w-sm mx-auto">
                Ao cadastrar tarefas com datas de vencimento ou prioridade alta/urgente, elas aparecerão automaticamente aqui.
              </p>
            </div>
          </div>
        ) : (
          sortedAlerts.map((task) => {
            const linkedCase = task.caseId ? cases.find((c) => c.id === task.caseId) : null;
            const isUrgente = task.priority === 'urgente';

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-none border transition-all ${
                  isUrgente
                    ? 'bg-red-950/20 border-red-500/40 hover:border-red-500/60'
                    : 'bg-[#050505] border-white/10 hover:border-[#C5A059]/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      className="mt-0.5 w-4 h-4 rounded-none bg-[#111111] border border-white/20 hover:border-[#C5A059] flex items-center justify-center text-white flex-shrink-0"
                      title="Marcar como cumprido"
                    >
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-1.5 py-0.5 bg-white/5 text-[#C5A059] border border-[#C5A059]/30 text-[9px] font-bold uppercase tracking-wider">
                          {task.category}
                        </span>

                        {task.priority && (
                          <span
                            className={`px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold ${
                              isUrgente
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {task.priority}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-semibold text-white mt-1">{task.title}</h4>

                      {/* Date & Linked Case */}
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px]">
                        {task.dueDate && (
                          <span className="text-amber-300/90 flex items-center gap-1 font-medium font-mono">
                            <Calendar size={11} />
                            <span>Vencimento: {task.dueDate.split('-').reverse().join('/')}</span>
                            {task.dueTime && <span>às {task.dueTime}</span>}
                          </span>
                        )}

                        {linkedCase && (
                          <button
                            type="button"
                            onClick={() => onSelectCaseForStrategy && onSelectCaseForStrategy(linkedCase)}
                            className="text-[#C5A059] hover:underline flex items-center gap-1 text-[11px]"
                          >
                            <Scale size={11} />
                            <span className="truncate max-w-[150px]">{linkedCase.title}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleTask(task.id)}
                    className="px-2.5 py-1 bg-[#111111] hover:bg-[#191919] border border-white/10 text-white/70 text-[10px] font-bold uppercase tracking-wider flex-shrink-0 transition-colors"
                  >
                    Cumprir
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
