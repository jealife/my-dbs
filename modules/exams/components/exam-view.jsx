'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, ClipboardList, Clock, AlertCircle, CheckCircle, GraduationCap, ArrowUpRight, Trophy, FileText, Target, BookOpen, TrendingUp, Loader2, X, Medal } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth-hook'
import { useStudentId } from '@/hooks/use-student-id'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { evaluationService } from '@/lib/evaluation-service'
import { formatDateFr } from '@/lib/api-helpers'
import { GradeEntryView } from './grade-entry-view'
import { toast } from 'react-hot-toast'

const STATUS_LABELS = {
  DRAFT: 'Brouillon',
  SCHEDULED: 'Planifié',
  IN_PROGRESS: 'En cours',
  CLOSED: 'Terminé',
  RESULTS_PUBLISHED: 'Résultats publiés'
}

const STATUS_COLORS = {
  DRAFT: 'text-slate-400 bg-slate-400/10',
  SCHEDULED: 'text-amber-500 bg-amber-500/10',
  IN_PROGRESS: 'text-blue-500 bg-blue-500/10',
  CLOSED: 'text-indigo-500 bg-indigo-500/10',
  RESULTS_PUBLISHED: 'text-emerald-500 bg-emerald-500/10',
}

export function ExamModuleView() {
  const { isStudent, isTeacher, isAdmin, user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEval, setSelectedEval] = useState(null)
  const [showNewEval, setShowNewEval] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [evalForm, setEvalForm] = useState({ title: '', evaluationType: 'EXAM', courseId: '', startAt: '', endAt: '', totalPoints: 20 })

  const createEvalMutation = useMutation({
    mutationFn: () => evaluationService.createEvaluation(evalForm),
    onSuccess: () => {
      toast.success('Évaluation créée !')
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
      setShowNewEval(false)
      setEvalForm({ title: '', evaluationType: 'EXAM', courseId: '', startAt: '', endAt: '', totalPoints: 20 })
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  })

  const studentId = useStudentId()

  // Fetch evaluations (scheduled/in-progress for upcoming, results_published for results)
  const { data: upcomingEvals = [], isLoading: loadingUpcoming } = useQuery({
    queryKey: ['evaluations', 'upcoming'],
    queryFn: () => evaluationService.getAll({ status: 'SCHEDULED' }),
  })

  // We should fetch IN_PROGRESS as well or simply fetch ALL and filter them
  // Assuming the backend has IN_PROGRESS evaluations for upcoming grading
  const { data: inprogressEvals = [] } = useQuery({
    queryKey: ['evaluations', 'inprogress'],
    queryFn: () => evaluationService.getAll({ status: 'IN_PROGRESS' }),
  })

  const { data: publishedEvals = [], isLoading: loadingPublished } = useQuery({
    queryKey: ['evaluations', 'published'],
    queryFn: () => evaluationService.getAll({ status: 'RESULTS_PUBLISHED' }),
  })

  const combinedUpcoming = [...upcomingEvals, ...inprogressEvals]
  const activeList = activeTab === 'upcoming' ? combinedUpcoming : publishedEvals
  const isLoading = activeTab === 'upcoming' ? loadingUpcoming : loadingPublished

  const filteredList = activeList.filter(ev =>
    !searchTerm || (ev.title || ev.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (selectedEval) {
    return <GradeEntryView evaluation={selectedEval} onBack={() => setSelectedEval(null)} />
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">Évaluations & <span className="text-primary italic">EXAMENS</span></h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">Suivi des performances, quiz, examens blancs et finaux.</p>
        </div>
        <div className="flex gap-4">
           {(isTeacher || isAdmin) ? (
             <button
               onClick={() => setShowNewEval(true)}
               className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all">
                <Plus className="w-5 h-5" />
                Planifier Évaluation
             </button>
           ) : (
             <button
               onClick={() => setShowLeaderboard(true)}
               className="flex items-center gap-2 px-6 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all">
                <Trophy className="w-4.5 h-4.5" />
                Tableau d'Excellence
             </button>
           )}
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-8 border-none ring-1 ring-(--glass-border) shadow-none bg-indigo-500/5 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Évaluations Planifiées</p>
              <h3 className="text-3xl font-black mt-2 tracking-tighter italic">{upcomingEvals.length}</h3>
            </div>
            <div className="p-3 bg-indigo-500 rounded-2xl shadow-xl shadow-indigo-500/20 text-white">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all" />
        </GlassCard>
        <GlassCard className="p-8 border-none ring-1 ring-(--glass-border) shadow-none bg-emerald-500/5 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Résultats Publiés</p>
              <h3 className="text-3xl font-black mt-2 tracking-tighter italic">{publishedEvals.length}</h3>
            </div>
            <div className="p-3 bg-emerald-500 rounded-2xl shadow-xl shadow-emerald-500/20 text-white">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />
        </GlassCard>
        <GlassCard className="p-8 border-none ring-1 ring-(--glass-border) shadow-none bg-amber-500/5 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Total Évaluations</p>
              <h3 className="text-3xl font-black mt-2 tracking-tighter italic">{upcomingEvals.length + publishedEvals.length}</h3>
            </div>
            <div className="p-3 bg-amber-500 rounded-2xl shadow-xl shadow-amber-500/20 text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all" />
        </GlassCard>
      </div>

      {/* Filter tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-2">
        <div className="flex gap-4 flex-wrap">
          {[
            { key: 'upcoming', label: 'À venir / En cours' },
            { key: 'results', label: 'Résultats publiés' },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                activeTab === tab.key ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]" : "glass-card hover:bg-primary/5 opacity-60 hover:opacity-100"
              )}
            >{tab.label}</button>
          ))}
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Rechercher une évaluation..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 font-bold text-xs uppercase outline-none w-64"
          />
        </div>
      </div>

      {/* Evaluation Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-xs font-black uppercase tracking-widest italic text-primary">Chargement évaluations...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="py-20 text-center glass-card opacity-40 rounded-3xl border-(--glass-border)">
          <p className="text-sm font-black italic uppercase tracking-widest">Aucune évaluation trouvée.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-1">
          {filteredList.map((ev, i) => (
            <motion.div key={ev.id || i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="group">
              <GlassCard className="relative overflow-hidden border-none ring-1 ring-(--glass-border) hover:ring-primary/40 transition-all p-8 flex flex-col gap-6 min-h-[250px]">
                <div className="flex justify-between items-start">
                  <span className={cn("px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest italic", STATUS_COLORS[ev.status] || 'text-slate-400 bg-slate-400/10')}>
                    {STATUS_LABELS[ev.status] || ev.status}
                  </span>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-(--glass-border) text-muted-foreground group-hover:text-primary transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tighter">{ev.title || ev.name}</h3>
                  {ev.courseId && <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mt-1 italic">Cours #{ev.courseId}</p>}
                  <div className="flex items-center gap-2 mt-3 opacity-50 italic">
                    <Clock className="w-3.5 h-3.5" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">{formatDateFr(ev.startAt || ev.createdAt)}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-(--glass-border)">
                  {activeTab === 'results' ? (
                    <button
                      onClick={() => setSelectedEval(ev)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all font-black text-xs uppercase tracking-widest group-hover:shadow-xl active:scale-95">
                      <ArrowUpRight className="w-4 h-4" />
                      Voir mes résultats
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedEval(ev)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all">
                      <Target className="w-4 h-4" />
                      Détails
                    </button>
                  )}
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal — Tableau d'Excellence */}
      <LeaderboardModal
        open={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        publishedEvals={publishedEvals}
      />

      {/* Modal — Planifier une Évaluation */}
      {showNewEval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg glass-card border border-(--glass-border) rounded-3xl p-8 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black italic tracking-tight">Planifier une Évaluation</h2>
              <button onClick={() => setShowNewEval(false)} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <X className="w-5 h-5 opacity-60" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Titre</label>
                <input type="text" placeholder="Ex: Examen Final — Semestre 1" value={evalForm.title}
                  onChange={e => setEvalForm({ ...evalForm, title: e.target.value })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Type</label>
                <select value={evalForm.evaluationType}
                  onChange={e => setEvalForm({ ...evalForm, evaluationType: e.target.value })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent">
                  <option value="EXAM">Examen</option>
                  <option value="QUIZ">Quiz</option>
                  <option value="ASSIGNMENT">Devoir</option>
                  <option value="PROJECT">Projet</option>
                  <option value="ORAL">Oral</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">ID Cours</label>
                <input type="number" placeholder="Ex: 5" value={evalForm.courseId}
                  onChange={e => setEvalForm({ ...evalForm, courseId: e.target.value })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Début</label>
                <input type="datetime-local" value={evalForm.startAt}
                  onChange={e => setEvalForm({ ...evalForm, startAt: e.target.value })}
                  className="w-full mt-1 p-3 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Fin</label>
                <input type="datetime-local" value={evalForm.endAt}
                  onChange={e => setEvalForm({ ...evalForm, endAt: e.target.value })}
                  className="w-full mt-1 p-3 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Points totaux</label>
                <input type="number" min={1} value={evalForm.totalPoints}
                  onChange={e => setEvalForm({ ...evalForm, totalPoints: parseInt(e.target.value) || 20 })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowNewEval(false)}
                className="flex-1 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-primary/30 transition-all">
                Annuler
              </button>
              <button
                onClick={() => createEvalMutation.mutate()}
                disabled={!evalForm.title || !evalForm.startAt || createEvalMutation.isPending}
                className="flex-1 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {createEvalMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />}
                Créer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function LeaderboardModal({ open, onClose, publishedEvals }) {
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['leaderboard', publishedEvals.map(e => e.id)],
    queryFn: async () => {
      if (!publishedEvals.length) return []
      const allGrades = await Promise.all(
        publishedEvals.map(ev => evaluationService.getGrades(ev.id))
      )
      const map = {}
      allGrades.flat().forEach(g => {
        const key = g.studentId
        if (!map[key]) map[key] = { studentId: key, name: g.studentName || g.studentFirstName || `Étudiant #${key}`, scores: [] }
        if (g.score != null) map[key].scores.push(Number(g.score))
      })
      return Object.values(map)
        .map(s => ({ ...s, avg: s.scores.length ? (s.scores.reduce((a, b) => a + b, 0) / s.scores.length) : 0 }))
        .sort((a, b) => b.avg - a.avg)
    },
    enabled: open && publishedEvals.length > 0,
  })

  const MEDALS = ['🥇', '🥈', '🥉']

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg glass-card border border-(--glass-border) rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-8 border-b border-(--glass-border)">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black italic tracking-tight">Tableau d'Excellence</h2>
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Classement par moyenne générale</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <X className="w-5 h-5 opacity-60" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 gap-3 opacity-40">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <p className="text-xs font-black uppercase tracking-widest">Calcul du classement...</p>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="py-12 text-center opacity-40">
                  <Trophy className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-black italic uppercase tracking-widest">Aucune note disponible.</p>
                </div>
              ) : leaderboard.map((student, i) => (
                <div key={student.studentId} className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl transition-all",
                  i === 0 ? "bg-amber-500/10 ring-1 ring-amber-500/30" :
                  i === 1 ? "bg-slate-400/10 ring-1 ring-slate-400/20" :
                  i === 2 ? "bg-amber-700/10 ring-1 ring-amber-700/20" :
                  "bg-slate-50/50 dark:bg-slate-900/50"
                )}>
                  <div className="w-10 text-center text-xl font-black shrink-0">
                    {i < 3 ? MEDALS[i] : <span className="text-sm opacity-40">#{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm truncate">{student.name}</p>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{student.scores.length} évaluation{student.scores.length > 1 ? 's' : ''}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={cn(
                      "text-xl font-black",
                      student.avg >= 16 ? "text-emerald-500" :
                      student.avg >= 12 ? "text-primary" :
                      student.avg >= 10 ? "text-amber-500" : "text-rose-500"
                    )}>{student.avg.toFixed(2)}</p>
                    <p className="text-[10px] font-bold opacity-40">/20</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
