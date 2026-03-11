import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  History, 
  User, 
  Calendar, 
  Clock, 
  Activity, 
  AlertTriangle, 
  ArrowRight, 
  Trash2,
  CheckCircle2,
  X
} from 'lucide-react';

interface AccessLog {
  id: number;
  visitor_name: string;
  date: string;
  entry_time: string;
  exit_time: string;
  activity: string;
  impact: string;
  next_steps: string;
  validated: number;
  created_at: string;
}

export default function App() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isManagerMode, setIsManagerMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [managerPassword, setManagerPassword] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  
  const [formData, setFormData] = useState({
    visitor_name: '',
    date: new Date().toISOString().split('T')[0],
    entry_time: '',
    exit_time: '',
    activity: '',
    impact: '',
    next_steps: ''
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs');
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!filterDateStart && !filterDateEnd) return true;
    const logDate = new Date(log.date);
    const start = filterDateStart ? new Date(filterDateStart) : null;
    const end = filterDateEnd ? new Date(filterDateEnd) : null;
    
    if (start && logDate < start) return false;
    if (end && logDate > end) return false;
    return true;
  });

  const handleManagerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Senha padrão para demonstração, pode ser movida para env futuramente
    if (managerPassword === 'admin123') {
      setIsManagerMode(true);
      setShowPasswordModal(false);
      setManagerPassword('');
    } else {
      alert('Senha incorreta!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        fetchLogs();
        setIsFormOpen(false);
        setFormData({
          visitor_name: '',
          date: new Date().toISOString().split('T')[0],
          entry_time: '',
          exit_time: '',
          activity: '',
          impact: '',
          next_steps: ''
        });
      }
    } catch (error) {
      console.error('Error saving log:', error);
    }
  };

  const handleValidate = async (id: number, currentStatus: number) => {
    if (!isManagerMode) {
      setShowPasswordModal(true);
      return;
    }
    try {
      const response = await fetch(`/api/logs/${id}/validate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validated: !currentStatus })
      });
      if (response.ok) {
        fetchLogs();
      }
    } catch (error) {
      console.error('Error validating log:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!isManagerMode) {
      setShowPasswordModal(true);
      return;
    }
    if (!confirm('Deseja realmente excluir este registro?')) return;
    try {
      const response = await fetch(`/api/logs/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchLogs();
      }
    } catch (error) {
      console.error('Error deleting log:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9] font-sans selection:bg-white selection:text-black relative overflow-x-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0 opacity-10 pointer-events-none"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] opacity-90 pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/5 p-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-900/40 backdrop-blur-xl">
          <div>
            <h1 className="font-sans font-black text-5xl tracking-tighter uppercase leading-none text-white">
              REGISTRO DE ACESSO - CPD
            </h1>
            <div className="flex items-center gap-4 mt-4">
              <p className="text-[10px] uppercase tracking-[0.3em] opacity-50 font-mono">Security & Infrastructure Control</p>
              <div className="h-px w-12 bg-white/20" />
              {isManagerMode && (
                <span className="text-[10px] uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
                  Modo Gerência Ativo
                </span>
              )}
            </div>
          </div>
            <div className="flex items-center gap-3">
              {isManagerMode ? (
                <button 
                  onClick={() => setIsManagerMode(false)}
                  className="flex items-center gap-2 px-6 py-4 border border-red-500/30 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20 transition-all active:scale-95 text-xs font-bold uppercase tracking-widest"
                >
                  <X size={18} />
                  Sair da Gerência
                </button>
              ) : (
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="p-3 border border-white/10 rounded-full hover:bg-white/5 transition-colors text-white/60 hover:text-white"
                  title="Acesso Gerencial"
                >
                  <AlertTriangle size={20} />
                </button>
              )}
              <button 
                onClick={() => setIsFormOpen(true)}
                className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full hover:bg-[#E4E3E0] transition-all active:scale-95 shadow-2xl shadow-white/10"
              >
                <Plus size={20} />
                <span className="font-bold uppercase text-xs tracking-widest">Novo Registro</span>
              </button>
            </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto">
          {/* Filters & Stats */}
          <div className="flex flex-col lg:flex-row gap-8 mb-12">
            {/* Stats */}
            <div className="flex-[2] grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-white/10 p-6 rounded-3xl bg-white/5 backdrop-blur-xl">
                <p className="text-[10px] uppercase tracking-widest opacity-40 font-mono mb-2">Total de Acessos</p>
                <p className="text-4xl font-serif italic text-white">{logs.length}</p>
              </div>
              <div className="border border-white/10 p-6 rounded-3xl bg-white/5 backdrop-blur-xl">
                <p className="text-[10px] uppercase tracking-widest opacity-40 font-mono mb-2">Última Visita</p>
                <p className="text-xl font-bold text-white truncate">{logs[0]?.visitor_name || '---'}</p>
                <p className="text-[10px] opacity-30 font-mono mt-1">
                  {logs[0] ? new Date(logs[0].date).toLocaleDateString('pt-BR') : ''}
                </p>
              </div>
            </div>

            {/* Date Filters */}
            <div className="flex-1 border border-white/10 p-6 rounded-3xl bg-white/5 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-4">
                <History size={14} className="opacity-40" />
                <p className="text-[10px] uppercase tracking-widest opacity-40 font-mono">Consulta por Período</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase opacity-30 ml-1">Início</span>
                  <input 
                    type="date"
                    value={filterDateStart}
                    onChange={e => setFilterDateStart(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm focus:border-white/30 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase opacity-30 ml-1">Fim</span>
                  <input 
                    type="date"
                    value={filterDateEnd}
                    onChange={e => setFilterDateEnd(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm focus:border-white/30 outline-none transition-all"
                  />
                </div>
              </div>
              {(filterDateStart || filterDateEnd) && (
                <button 
                  onClick={() => { setFilterDateStart(''); setFilterDateEnd(''); }}
                  className="mt-4 text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          </div>

          {/* Logs Table */}
          <div className="border border-white/10 rounded-[2rem] overflow-hidden bg-black/20 backdrop-blur-md shadow-2xl">
            <div className="grid grid-cols-12 gap-4 p-6 border-b border-white/10 bg-white/5 text-[10px] uppercase tracking-[0.2em] font-mono opacity-40">
              <div className="col-span-3">Visitante</div>
              <div className="col-span-2">Data / Horário</div>
              <div className="col-span-2">Atividade</div>
              <div className="col-span-2">Impacto / Próximos</div>
              <div className="col-span-2 text-center">Situação</div>
              <div className="col-span-1 text-right">Ações</div>
            </div>

            <div className="divide-y divide-white/5">
              {isLoading ? (
                <div className="p-20 text-center opacity-30 font-serif italic text-xl">Sincronizando dados...</div>
              ) : filteredLogs.length === 0 ? (
                <div className="p-20 text-center opacity-30 font-serif italic text-xl">Nenhum registro no período.</div>
              ) : (
                filteredLogs.map((log) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={log.id} 
                    className="grid grid-cols-12 gap-4 p-6 hover:bg-white/[0.03] transition-colors group"
                  >
                    <div className="col-span-3 flex flex-col justify-center">
                      <span className="font-bold text-xl tracking-tight text-white">{log.visitor_name}</span>
                    </div>
                    <div className="col-span-2 flex flex-col justify-center font-mono text-[11px]">
                      <div className="flex items-center gap-2 opacity-40">
                        <Calendar size={12} />
                        {new Date(log.date).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-white/80">
                        <Clock size={12} className="opacity-40" />
                        {log.entry_time} {log.exit_time ? `→ ${log.exit_time}` : ''}
                      </div>
                    </div>
                    <div className="col-span-2 flex flex-col justify-center">
                      <p className="text-sm line-clamp-2 opacity-60 leading-relaxed">{log.activity}</p>
                    </div>
                    <div className="col-span-2 flex flex-col justify-center gap-2">
                      {log.impact && (
                        <div className="flex items-start gap-2 text-[10px]">
                          <AlertTriangle size={12} className="mt-0.5 text-amber-500/60" />
                          <span className="opacity-40 italic">{log.impact}</span>
                        </div>
                      )}
                      {log.next_steps && (
                        <div className="flex items-start gap-2 text-[10px]">
                          <ArrowRight size={12} className="mt-0.5 opacity-20" />
                          <span className="opacity-40">{log.next_steps}</span>
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <button
                        onClick={() => handleValidate(log.id, log.validated)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                          log.validated 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        } ${isManagerMode ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}`}
                      >
                        {log.validated ? <CheckCircle2 size={14} /> : <X size={14} />}
                        {log.validated ? 'Validada' : 'Não Validada'}
                      </button>
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <button 
                        onClick={() => handleDelete(log.id)}
                        className={`p-3 rounded-2xl transition-all ${
                          isManagerMode 
                          ? 'hover:bg-red-500 text-red-500 hover:text-white opacity-100' 
                          : 'hover:bg-white/10 text-white/20 hover:text-white opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </main>

        {/* Password Modal */}
        <AnimatePresence>
          {showPasswordModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPasswordModal(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-sm bg-[#141414] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                    <AlertTriangle size={32} className="text-amber-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h2>
                  <p className="text-xs opacity-40 uppercase tracking-widest font-mono">Digite a senha de gerência</p>
                </div>

                <form onSubmit={handleManagerLogin} className="space-y-6">
                  <input 
                    autoFocus
                    type="password"
                    value={managerPassword}
                    onChange={e => setManagerPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-center text-2xl tracking-[0.5em] focus:border-white/30 outline-none transition-all"
                    placeholder="••••"
                  />
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowPasswordModal(false)}
                      className="flex-1 py-4 rounded-2xl border border-white/10 text-xs uppercase tracking-widest font-bold hover:bg-white/5 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 rounded-2xl bg-white text-black text-xs uppercase tracking-widest font-bold hover:bg-[#E4E3E0] transition-colors"
                    >
                      Confirmar
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Form Modal (Existing) */}
        <AnimatePresence>
          {isFormOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFormOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-2xl bg-[#0a0a0b] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl"
              >
                <div className="flex justify-between items-center p-10 border-b border-white/5">
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">NOVO REGISTRO</h2>
                    <p className="text-[10px] uppercase tracking-widest opacity-30 font-mono mt-1">Data Center Entry Log</p>
                  </div>
                  <button onClick={() => setIsFormOpen(false)} className="p-4 hover:bg-white/5 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="col-span-2">
                      <label className="block text-[10px] uppercase tracking-widest font-mono mb-3 opacity-30">Nome do Visitante</label>
                      <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20" size={20} />
                        <input 
                          required
                          type="text"
                          value={formData.visitor_name}
                          onChange={e => setFormData({...formData, visitor_name: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 focus:border-white/30 outline-none transition-all text-white"
                          placeholder="Nome completo"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-mono mb-3 opacity-30">Data</label>
                      <input 
                        required
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 focus:border-white/30 outline-none transition-all text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-mono mb-3 opacity-30">Entrada</label>
                        <input 
                          required
                          type="time"
                          value={formData.entry_time}
                          onChange={e => setFormData({...formData, entry_time: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 focus:border-white/30 outline-none transition-all text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-mono mb-3 opacity-30">Saída</label>
                        <input 
                          type="time"
                          value={formData.exit_time}
                          onChange={e => setFormData({...formData, exit_time: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 focus:border-white/30 outline-none transition-all text-white"
                        />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[10px] uppercase tracking-widest font-mono mb-3 opacity-30">Atividade Realizada</label>
                      <textarea 
                        required
                        rows={3}
                        value={formData.activity}
                        onChange={e => setFormData({...formData, activity: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 focus:border-white/30 outline-none transition-all resize-none text-white"
                        placeholder="Descreva as tarefas executadas..."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-mono mb-3 opacity-30">Impacto Gerado</label>
                      <input 
                        type="text"
                        value={formData.impact}
                        onChange={e => setFormData({...formData, impact: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 focus:border-white/30 outline-none transition-all text-white"
                        placeholder="Ex: Downtime de 5min"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-mono mb-3 opacity-30">Próximos Passos</label>
                      <input 
                        type="text"
                        value={formData.next_steps}
                        onChange={e => setFormData({...formData, next_steps: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 focus:border-white/30 outline-none transition-all text-white"
                        placeholder="Ex: Monitoramento"
                      />
                    </div>
                  </div>

                  <div className="pt-6">
                    <button 
                      type="submit"
                      className="w-full bg-white text-black py-6 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-[#E4E3E0] transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/5"
                    >
                      <CheckCircle2 size={20} />
                      Finalizar Registro
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="p-10 border-t border-white/5 mt-20 flex justify-between items-center opacity-20 text-[9px] uppercase tracking-[0.4em] font-mono">
          <div>© 2026 CPD INFRASTRUCTURE SECURITY</div>
          <div className="flex items-center gap-4">
            <span>System Status: Optimal</span>
            <div className="w-1 h-1 bg-emerald-500 rounded-full" />
            <span>Encrypted Session</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
