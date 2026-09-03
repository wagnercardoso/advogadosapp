import React, { useState, useMemo } from 'react';
import { Task, LegalCase, TaskPriority } from '../types';
import { Trash2, X, Plus, Calendar, AlertCircle, Scale, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface AgendaViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  cases: LegalCase[];
  onSelectCaseForStrategy?: (caseItem: LegalCase) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  tasks,
  setTasks,
  categories,
  setCategories,
  cases,
  onSelectCaseForStrategy,
}) => {
  // Input states
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || 'Geral');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [activeFilterCategory, setActiveFilterCategory] = useState<string>('Todas');

  // Advanced options toggle (Deadlines & Link to Case)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('media');
  const [selectedCaseId, setSelectedCaseId] = useState('');

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const percentComplete = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate stats per category
  const categoryStats = useMemo(() => {
    // Collect all distinct categories currently present in categories list or tasks
    const allCats = Array.from(new Set([...categories, ...tasks.map((t) => t.category).filter(Boolean)]));
    return allCats.map((cat) => {
      const catTasks = tasks.filter((t) => t.category === cat);
      const catTotal = catTasks.length;
      const catDone = catTasks.filter((t) => t.completed).length;
      return {
        category: cat,
        done: catDone,
        total: catTotal,
      };
    });
  }, [categories, tasks]);

  // Handle adding a task
  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;

    let finalCategory = selectedCategory;
    const trimmedNewCat = newCategoryInput.trim();
    if (trimmedNewCat) {
      finalCategory = trimmedNewCat;
      if (!categories.includes(trimmedNewCat)) {
        setCategories((prev) => [...prev, trimmedNewCat]);
      }
    }

    const newTask: Task = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title,
      category: finalCategory || 'Geral',
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      priority: priority || 'media',
      caseId: selectedCaseId || undefined,
    };

    setTasks((prev) => [newTask, ...prev]);

    // Reset inputs
    setTaskTitle('');
    setNewCategoryInput('');
    setDueDate('');
    setDueTime('');
    setSelectedCaseId('');
    setShowAdvancedOptions(false);
  };

  // Toggle task completion
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Delete category
  const handleDeleteCategory = (catToDelete: string) => {
    if (window.confirm(`Deseja remover a categoria "${catToDelete}"? As tarefas associadas serão movidas para "Geral".`)) {
      setCategories((prev) => prev.filter((c) => c !== catToDelete));
      setTasks((prev) =>
        prev.map((t) => (t.category === catToDelete ? { ...t, category: 'Geral' } : t))
      );
      if (selectedCategory === catToDelete) {
        setSelectedCategory('Geral');
      }
      if (activeFilterCategory === catToDelete) {
        setActiveFilterCategory('Todas');
      }
    }
  };

  // Filter tasks for list
  const filteredTasks = useMemo(() => {
    if (activeFilterCategory === 'Todas') {
      return tasks;
    }
    return tasks.filter((t) => t.category === activeFilterCategory);
  }, [tasks, activeFilterCategory]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 pb-12">
      {/* Title with icon matching layout */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 pt-1">
        <div>
          <h2 className="text-2xl font-serif text-white flex items-center gap-2 font-['Cinzel',serif] tracking-wider">
            <span className="w-1.5 h-5 bg-[#C5A059] inline-block rounded-none"></span>
            Agenda & Prazos
          </h2>
          <p className="text-white/40 text-xs mt-0.5">
            {totalTasks === 0 ? 'Nenhum dado cadastrado para o período selecionado.' : `${totalTasks} tarefas registradas na sua pauta.`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const input = document.getElementById('new-task-input');
            if (input) input.focus();
          }}
          className="bg-[#C5A059] hover:bg-[#D4B069] text-black text-xs font-bold uppercase py-2 px-4 tracking-widest transition-all shadow-sm flex items-center gap-1.5"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Metric summary blocks (Sophisticated Dark layout) */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white/[0.03] border border-white/10 p-4 rounded-sm flex flex-col justify-center items-center">
          <p className="text-[#C5A059] text-[10px] uppercase tracking-widest mb-1 font-bold">Total</p>
          <p className="text-2xl sm:text-3xl font-serif text-white/90">{totalTasks}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/10 p-4 rounded-sm flex flex-col justify-center items-center">
          <p className="text-[#C5A059] text-[10px] uppercase tracking-widest mb-1 font-bold">Pendentes</p>
          <p className="text-2xl sm:text-3xl font-serif text-white/90">{pendingTasks}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/10 p-4 rounded-sm flex flex-col justify-center items-center">
          <p className="text-[#C5A059] text-[10px] uppercase tracking-widest mb-1 font-bold">Concluídas</p>
          <p className="text-2xl sm:text-3xl font-serif text-white/90">{completedTasks}</p>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="bg-[#0a0a0a] border border-white/10 p-3.5 rounded-sm space-y-2">
        <div className="flex justify-between items-center text-xs text-white/60">
          <span className="uppercase text-[10px] tracking-wider text-[#C5A059] font-bold">Progresso da Pauta</span>
          <span className="font-mono text-white/80">{percentComplete}% concluído</span>
        </div>
        <div className="w-full bg-[#141414] h-3 rounded-none overflow-hidden border border-white/5 relative">
          <div
            className="h-full bg-gradient-to-r from-[#C5A059] to-[#DFB86C] transition-all duration-500 ease-out"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>

      {/* Categories Summary List (if categories exist) */}
      {categoryStats.length > 0 && (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-sm divide-y divide-white/5 overflow-hidden shadow-sm">
          <div className="px-4 py-2 bg-white/[0.02] border-b border-white/5">
            <span className="text-[10px] uppercase text-[#C5A059] tracking-widest font-bold">
              Resumo por Categorias
            </span>
          </div>
          {categoryStats.map((cat) => (
            <div
              key={cat.category}
              className="flex items-center justify-between px-4 py-2.5 text-xs hover:bg-white/5 transition-colors"
            >
              <span className="text-white/80 font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#C5A059]"></span>
                <span className="font-semibold text-white">{cat.category}</span>
                <span className="text-white/40 font-normal">
                  ({cat.done} de {cat.total} feitas)
                </span>
              </span>
              <button
                type="button"
                onClick={() => handleDeleteCategory(cat.category)}
                className="text-white/30 hover:text-red-400 p-1 rounded transition-colors"
                title={`Excluir categoria ${cat.category}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Task Form */}
      <form onSubmit={handleAddTask} className="space-y-3 bg-[#0a0a0a] p-4 rounded-sm border border-white/10 shadow-lg">
        <p className="text-[10px] uppercase text-[#C5A059] tracking-widest font-bold flex items-center gap-2">
          <span className="w-1 h-3 bg-[#C5A059]"></span> Cadastrar Tarefa / Compromisso
        </p>

        {/* Task Title Input */}
        <div>
          <input
            id="new-task-input"
            type="text"
            placeholder="Descreva a tarefa jurídica, prazo fatal ou audiência..."
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="w-full bg-[#111111] border border-white/15 rounded-sm px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059] transition-all"
          />
        </div>

        {/* Category selector + New category input + Add button row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <div className="flex-1 min-w-[120px]">
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-[#C5A059]"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#111111] text-white">
                  {c}
                </option>
              ))}
              {!categories.includes('Geral') && (
                <option value="Geral" className="bg-[#111111] text-white">
                  Geral
                </option>
              )}
            </select>
          </div>

          {/* New Category Input */}
          <div className="flex-1 min-w-[140px]">
            <input
              id="new-category-input"
              type="text"
              placeholder="Nova categoria (opcional)"
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
              className="w-full bg-[#111111] border border-white/15 rounded-sm px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          {/* Add Button */}
          <button
            id="add-task-btn"
            type="submit"
            disabled={!taskTitle.trim()}
            className="px-5 py-2 bg-[#C5A059] hover:bg-[#D4B069] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Adicionar</span>
          </button>
        </div>

        {/* Collapsible toggle for Lawyer Details: Case Link, Due Date, Priority */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="text-[11px] text-[#C5A059] hover:underline flex items-center gap-1 py-1 font-medium tracking-wide uppercase text-[10px]"
          >
            {showAdvancedOptions ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            <span>{showAdvancedOptions ? 'Ocultar detalhes avançados' : '+ Definir prazo, prioridade e vincular a um Caso/Processo'}</span>
          </button>

          {showAdvancedOptions && (
            <div className="mt-2 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {/* Due Date & Time */}
              <div>
                <label className="block text-white/50 mb-1 flex items-center gap-1 text-[11px]">
                  <Calendar size={11} className="text-[#C5A059]" /> Data do Prazo:
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-sm px-2 py-1.5 text-white text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-white/50 mb-1 flex items-center gap-1 text-[11px]">
                  <Clock size={11} className="text-[#C5A059]" /> Horário:
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-sm px-2 py-1.5 text-white text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-white/50 mb-1 flex items-center gap-1 text-[11px]">
                  <AlertCircle size={11} className="text-[#C5A059]" /> Prioridade:
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full bg-[#111111] border border-white/15 rounded-sm px-2 py-1.5 text-white text-xs focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              {/* Case Linking */}
              <div className="sm:col-span-3">
                <label className="block text-white/50 mb-1 flex items-center gap-1 text-[11px]">
                  <Scale size={11} className="text-[#C5A059]" /> Vincular a um Caso/Processo cadastrado:
                </label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-sm px-2 py-1.5 text-white text-xs focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="">Nenhum processo vinculado</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      ⚖️ {c.title} ({c.clientName || 'Cliente sem nome'})
                    </option>
                  ))}
                </select>
                {cases.length === 0 && (
                  <p className="text-[10px] text-white/40 mt-0.5">
                    Nenhum caso cadastrado ainda. Você pode cadastrar causas na aba "Casos & IA".
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Filter Tabs matching the image */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-white/5 pt-1">
        <button
          type="button"
          onClick={() => setActiveFilterCategory('Todas')}
          className={`px-3 py-1.5 rounded-sm text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all ${
            activeFilterCategory === 'Todas'
              ? 'bg-[#C5A059] text-black font-bold shadow-sm'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          Todas
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-sm text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all ${
              activeFilterCategory === cat
                ? 'bg-[#C5A059] text-black font-bold shadow-sm'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Task List Items */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 px-4 bg-[#0a0a0a] border border-white/10 text-white/40 space-y-3">
            <svg className="w-10 h-10 text-white/10 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
            </svg>
            <p className="text-xs italic text-white/40">
              Sua agenda está vazia.<br />Use o formulário acima para cadastrar sua primeira tarefa.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const linkedCase = task.caseId ? cases.find((c) => c.id === task.caseId) : null;

            return (
              <div
                key={task.id}
                className={`flex items-center justify-between p-3.5 rounded-sm border transition-all ${
                  task.completed
                    ? 'bg-black/60 border-white/5 opacity-60'
                    : 'bg-[#0a0a0a] border-white/10 hover:border-[#C5A059]/40'
                }`}
              >
                {/* Left: Checkbox + Title + Badges */}
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
                      <svg
                        className="w-3 h-3 text-black font-bold"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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

                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {/* Category Pill Tag */}
                      <span className="px-2 py-0.5 rounded-none bg-white/5 text-[#C5A059] text-[10px] uppercase font-bold tracking-wider border border-[#C5A059]/30">
                        {task.category}
                      </span>

                      {/* Linked Case Tag */}
                      {linkedCase && (
                        <button
                          type="button"
                          onClick={() => onSelectCaseForStrategy && onSelectCaseForStrategy(linkedCase)}
                          className="px-2 py-0.5 rounded-none bg-[#C5A059]/15 text-[#DFB86C] text-[10px] font-medium border border-[#C5A059]/40 hover:bg-[#C5A059]/25 transition-colors flex items-center gap-1"
                          title="Clique para ver detalhes do caso e estratégia de IA"
                        >
                          <Scale size={10} />
                          <span className="truncate max-w-[120px]">{linkedCase.title}</span>
                        </button>
                      )}

                      {/* Due Date & Time */}
                      {task.dueDate && (
                        <span className="px-2 py-0.5 rounded-none bg-black/60 text-white/70 text-[10px] flex items-center gap-1 border border-white/10 font-mono">
                          <Calendar size={10} className="text-[#C5A059]" />
                          <span>{task.dueDate.split('-').reverse().join('/')}</span>
                          {task.dueTime && <span>{task.dueTime}</span>}
                        </span>
                      )}

                      {/* Priority Tag */}
                      {task.priority && task.priority !== 'baixa' && (
                        <span
                          className={`px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider ${
                            task.priority === 'urgente'
                              ? 'bg-red-950/40 text-red-400 border border-red-500/40'
                              : task.priority === 'alta'
                              ? 'bg-amber-950/40 text-[#DFB86C] border border-[#C5A059]/40'
                              : 'bg-white/5 text-white/60'
                          }`}
                        >
                          {task.priority}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Delete button */}
                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-white/30 hover:text-red-400 p-1.5 rounded hover:bg-white/5 transition-colors flex-shrink-0"
                  title="Excluir tarefa"
                >
                  <X size={15} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
