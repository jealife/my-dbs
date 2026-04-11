'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserCheck, Calendar, MessageSquare, Star, TrendingUp, Search, ArrowUpRight, Target, Clock, Loader2, Plus, X, ClipboardList, CheckCircle } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useAuth } from '@/hooks/use-auth-hook'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mentoringService } from '@/lib/mentoring-service'
import { formatDateFr } from '@/lib/api-helpers'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

const SESSION_STATUS_COLORS = {
  SCHEDULED: 'text-amber-500 bg-amber-500/10',
  CONFIRMED: 'text-emerald-500 bg-emerald-500/10',
  COMPLETED: 'text-blue-500 bg-blue-500/10',
  CANCELLED: 'text-rose-500 bg-rose-500/10',
}

export function MentoringModuleView() {
  const { user, isMentor, isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.id || user?.userId

  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showActionPlanModal, setShowActionPlanModal] = useState(false)
  const [selectedMentorshipId, setSelectedMentorshipId] = useState(null)
  const [bookingForm, setBookingForm] = useState({ topic: '', scheduledAt: '', duration: 60, notes: '' })
  const [actionPlanForm, setActionPlanForm] = useState({ title: '', description: '', deadline: '' })

  const { data: mentorships = [], isLoading: loadingMentorships } = useQuery({
    queryKey: ['mentorships', userId, isMentor ? 'mentor' : 'mentee'],
    queryFn: () => isMentor
      ? mentoringService.getMentorMentorships(userId)
      : mentoringService.getMenteeMentorships(userId),
    enabled: !!userId,
  })

  const firstMentorshipId = mentorships[0]?.id
  const activeMentorshipId = selectedMentorshipId || firstMentorshipId

  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['mentoring-sessions', activeMentorshipId],
    queryFn: () => mentoringService.getSessions(activeMentorshipId),
    enabled: !!activeMentorshipId,
  })

  const { data: actionPlans = [], isLoading: loadingPlans } = useQuery({
    queryKey: ['mentoring-action-plans', activeMentorshipId],
    queryFn: () => mentoringService.getActionPlans(activeMentorshipId),
    enabled: !!activeMentorshipId,
  })

  const bookSessionMutation = useMutation({
    mutationFn: (data) => mentoringService.planSession(activeMentorshipId, data),
    onSuccess: () => {
      toast.success('Session planifiée avec succès !')
      queryClient.invalidateQueries({ queryKey: ['mentoring-sessions'] })
      setShowBookingModal(false)
      setBookingForm({ topic: '', scheduledAt: '', duration: 60, notes: '' })
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  })

  const createPlanMutation = useMutation({
    mutationFn: (data) => mentoringService.createActionPlan(activeMentorshipId, data),
    onSuccess: () => {
      toast.success('Plan d\'action créé !')
      queryClient.invalidateQueries({ queryKey: ['mentoring-action-plans'] })
      setShowActionPlanModal(false)
      setActionPlanForm({ title: '', description: '', deadline: '' })
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  })

  const upcomingSessions = sessions.filter(s => ['SCHEDULED', 'CONFIRMED'].includes(s.status))

  return (
    <div className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter">
            {isMentor ? 'Espace' : 'Programme de'} <span className="text-primary">{isMentor ? 'MENTOR' : 'Mentorat'}</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-medium italic opacity-70">
            {isMentor ? 'Gérez vos sessions d\'accompagnement et suivez vos étudiants.' : 'Connectez-vous avec des experts pour booster votre parcours.'}
          </p>
        </div>
        <button
          onClick={() => activeMentorshipId ? setShowBookingModal(true) : toast.error('Aucun mentorat actif trouvé.')}
          className="px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all self-start flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {isMentor ? 'Nouvelle Disponibilité' : 'Réserver une séance'}
        </button>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 border-none ring-1 ring-(--glass-border) relative overflow-hidden">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20"><UserCheck className="w-6 h-6" /></div>
            <div>
              <p className="text-2xl font-black italic">{loadingMentorships ? '—' : mentorships.length}</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{isMentor ? 'Étudiants Suivis' : 'Mentors Actifs'}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-6 border-none ring-1 ring-(--glass-border) relative overflow-hidden">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20"><Target className="w-6 h-6" /></div>
            <div>
              <p className="text-2xl font-black italic">{loadingSessions ? '—' : upcomingSessions.length}</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Sessions À venir</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-6 border-none ring-1 ring-(--glass-border) relative overflow-hidden">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20"><Star className="w-6 h-6" /></div>
            <div>
              <p className="text-2xl font-black italic">{sessions.filter(s => s.status === 'COMPLETED').length}</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Sessions Complètes</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <GlassCard title="Prochaines Séances" description="Vos rendez-vous de mentoring confirmés." className="shadow-none border-none ring-1 ring-(--glass-border)">
          <div className="space-y-4 pt-4">
            {loadingSessions ? (
              <div className="flex flex-col items-center py-10 gap-3 opacity-40">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-xs font-black uppercase tracking-widest italic">Chargement sessions...</p>
              </div>
            ) : upcomingSessions.length === 0 ? (
              <div className="py-10 text-center opacity-40">
                <p className="text-sm font-black italic uppercase tracking-widest">Aucune session à venir.</p>
              </div>
            ) : upcomingSessions.map(session => (
              <div key={session.id} className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-(--glass-border) flex items-center gap-4 hover:border-primary/50 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-(--glass-border) flex items-center justify-center text-primary">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm tracking-tight">{session.topic || session.title || `Session #${session.id}`}</h4>
                  <p className="text-xs font-medium opacity-50 italic">
                    {session.scheduledAt ? formatDateFr(session.scheduledAt) : '—'} • {session.duration || '—'} min
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={cn("text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest", SESSION_STATUS_COLORS[session.status] || 'text-slate-400 bg-slate-400/10')}>
                    {session.status}
                  </span>
                  <button className="p-2 rounded-xl hover:bg-primary/10 text-primary transition-all"><MessageSquare className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-4 rounded-2xl border border-dashed border-(--glass-border) hover:border-primary/50 hover:bg-primary/5 text-xs font-black uppercase tracking-widest transition-all italic opacity-60">
            Voir tout l&apos;historique
          </button>
        </GlassCard>

        {/* Mentorship List */}
        <GlassCard
          title={isMentor ? 'Vos Étudiants' : 'Vos Mentors'}
          description={isMentor ? 'Liste des étudiants sous votre supervision.' : 'Vos accompagnateurs sélectionnés.'}
          className="shadow-none border-none ring-1 ring-(--glass-border)"
        >
          <div className="space-y-4 pt-4">
            {loadingMentorships ? (
              <div className="flex flex-col items-center py-10 gap-3 opacity-40">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-xs font-black uppercase tracking-widest italic">Chargement...</p>
              </div>
            ) : mentorships.length === 0 ? (
              <div className="py-10 text-center opacity-40">
                <p className="text-sm font-black italic uppercase tracking-widest">Aucun {isMentor ? 'étudiant' : 'mentor'} assigné.</p>
              </div>
            ) : mentorships.map(ms => {
              const person = isMentor ? ms.mentee : ms.mentor
              const initials = `${person?.firstName?.[0] || ''}${person?.lastName?.[0] || 'M'}`
              return (
                <div key={ms.id} className="p-4 rounded-3xl group hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-(--glass-border) flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl premium-gradient p-px shadow-xl shadow-primary/10">
                    <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center font-black italic text-sm">
                      {initials}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm tracking-tight">{person?.firstName} {person?.lastName}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-primary/70">{person?.email || ms.status}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest", ms.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-slate-100 text-slate-500')}>{ms.status}</span>
                    </div>
                  </div>
                  <button className="p-3 rounded-2xl glass-card hover:bg-primary hover:text-white transition-all"><ArrowUpRight className="w-5 h-5" /></button>
                </div>
              )
            })}
          </div>
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input type="text" placeholder="Rechercher par domaine..." className="w-full bg-slate-50 dark:bg-slate-900/40 border-none ring-1 ring-(--glass-border) rounded-2xl pl-12 pr-4 py-4 text-xs font-medium focus:ring-primary/50 transition-all outline-none" />
          </div>
        </GlassCard>
      </div>

      {/* Action Plans Section */}
      <GlassCard
        title="Plans d'Action"
        description="Objectifs et étapes de développement."
        className="shadow-none border-none ring-1 ring-(--glass-border)"
      >
        <div className="flex justify-end mb-4">
          <button
            onClick={() => activeMentorshipId ? setShowActionPlanModal(true) : toast.error('Aucun mentorat actif.')}
            className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-2"
          >
            <Plus className="w-3 h-3" /> Nouveau Plan
          </button>
        </div>
        <div className="space-y-3">
          {loadingPlans ? (
            <div className="flex flex-col items-center py-10 gap-3 opacity-40">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-xs font-black uppercase tracking-widest italic">Chargement plans...</p>
            </div>
          ) : actionPlans.length === 0 ? (
            <div className="py-10 text-center opacity-40">
              <ClipboardList className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-black italic uppercase tracking-widest">Aucun plan d&apos;action.</p>
            </div>
          ) : actionPlans.map(plan => (
            <div key={plan.id} className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-(--glass-border) flex items-center gap-4 hover:border-primary/50 transition-all">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                plan.completed || plan.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
              )}>
                {plan.completed || plan.status === 'COMPLETED' ? <CheckCircle className="w-5 h-5" /> : <Target className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm tracking-tight truncate">{plan.title || plan.objective || `Plan #${plan.id}`}</h4>
                <p className="text-[10px] font-medium opacity-50 italic truncate">{plan.description || '—'}</p>
              </div>
              <span className={cn("text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shrink-0",
                plan.completed || plan.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
              )}>
                {plan.completed || plan.status === 'COMPLETED' ? 'Terminé' : 'En cours'}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Booking Session Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowBookingModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-950 rounded-4xl shadow-2xl w-full max-w-md p-8 space-y-6 border border-(--glass-border)">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black italic">{isMentor ? 'Planifier une séance' : 'Réserver une séance'}</h3>
                <button onClick={() => setShowBookingModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5 block">Sujet de la séance</label>
                  <input type="text" value={bookingForm.topic} onChange={e => setBookingForm(p => ({ ...p, topic: e.target.value }))} placeholder="Ex: Orientation professionnelle" className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-(--glass-border) text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5 block">Date & Heure</label>
                  <input type="datetime-local" value={bookingForm.scheduledAt} onChange={e => setBookingForm(p => ({ ...p, scheduledAt: e.target.value }))} className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-(--glass-border) text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5 block">Durée (minutes)</label>
                  <select value={bookingForm.duration} onChange={e => setBookingForm(p => ({ ...p, duration: Number(e.target.value) }))} className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-(--glass-border) text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30">
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>1 heure</option>
                    <option value={90}>1h30</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5 block">Notes (optionnel)</label>
                  <textarea value={bookingForm.notes} onChange={e => setBookingForm(p => ({ ...p, notes: e.target.value }))} placeholder="Précisions ou objectifs..." rows={3} className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-(--glass-border) text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                </div>
              </div>
              <button
                onClick={() => bookSessionMutation.mutate(bookingForm)}
                disabled={bookSessionMutation.isPending || !bookingForm.topic || !bookingForm.scheduledAt}
                className="w-full py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {bookSessionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                {bookSessionMutation.isPending ? 'Planification...' : 'Confirmer la séance'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Plan Modal */}
      <AnimatePresence>
        {showActionPlanModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowActionPlanModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-950 rounded-4xl shadow-2xl w-full max-w-md p-8 space-y-6 border border-(--glass-border)">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black italic">Nouveau Plan d&apos;Action</h3>
                <button onClick={() => setShowActionPlanModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5 block">Objectif</label>
                  <input type="text" value={actionPlanForm.title} onChange={e => setActionPlanForm(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Améliorer les compétences en leadership" className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-(--glass-border) text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5 block">Description</label>
                  <textarea value={actionPlanForm.description} onChange={e => setActionPlanForm(p => ({ ...p, description: e.target.value }))} placeholder="Étapes et détails du plan..." rows={4} className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-(--glass-border) text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5 block">Échéance</label>
                  <input type="date" value={actionPlanForm.deadline} onChange={e => setActionPlanForm(p => ({ ...p, deadline: e.target.value }))} className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-(--glass-border) text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <button
                onClick={() => createPlanMutation.mutate({ title: actionPlanForm.title, objective: actionPlanForm.title, description: actionPlanForm.description, deadline: actionPlanForm.deadline })}
                disabled={createPlanMutation.isPending || !actionPlanForm.title}
                className="w-full py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {createPlanMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />}
                {createPlanMutation.isPending ? 'Création...' : 'Créer le plan'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
