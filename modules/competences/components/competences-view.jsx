'use client'

import { motion } from 'framer-motion'
import { Award, Star, Target, Plus, BookOpen, ChevronRight, Loader2, Check, Trophy, Zap, X } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useAuth } from '@/hooks/use-auth-hook'
import { useStudentId } from '@/hooks/use-student-id'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { competencesService } from '@/lib/competences-service'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useState } from 'react'

const LEVEL_COLORS = {
  BEGINNER: 'text-slate-500 bg-slate-500/10',
  INTERMEDIATE: 'text-blue-500 bg-blue-500/10',
  ADVANCED: 'text-indigo-500 bg-indigo-500/10',
  EXPERT: 'text-emerald-500 bg-emerald-500/10',
}

const LEVEL_LABELS = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
  EXPERT: 'Expert',
}

const LEVEL_PROGRESS = { BEGINNER: 25, INTERMEDIATE: 50, ADVANCED: 75, EXPERT: 100 }

export function CompetencesModuleView() {
  const { user, isAdmin, isTeacher } = useAuth()
  const queryClient = useQueryClient()
  const studentId = useStudentId()

  const [showCreateCompetence, setShowCreateCompetence] = useState(false)
  const [showAwardBadge, setShowAwardBadge] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState(null)
  const [createForm, setCreateForm] = useState({ code: '', name: '', description: '', creditValue: 1 })
  const [awardForm, setAwardForm] = useState({ studentId: '', comment: '' })

  const { data: competences = [], isLoading: loadingCompetences } = useQuery({
    queryKey: ['competences'],
    queryFn: () => competencesService.getAll(),
  })

  const { data: portfolio = [], isLoading: loadingPortfolio } = useQuery({
    queryKey: ['competences-portfolio', studentId],
    queryFn: () => competencesService.getStudentPortfolio(studentId),
    enabled: !!studentId,
  })

  const { data: badges = [], isLoading: loadingBadges } = useQuery({
    queryKey: ['badges'],
    queryFn: () => competencesService.getBadges(),
  })

  const { data: myBadges = [], isLoading: loadingMyBadges } = useQuery({
    queryKey: ['my-badges', studentId],
    queryFn: () => competencesService.getStudentBadges(studentId),
    enabled: !!studentId,
  })

  const createCompetenceMutation = useMutation({
    mutationFn: () => competencesService.create(createForm),
    onSuccess: () => {
      toast.success('Compétence créée !')
      queryClient.invalidateQueries({ queryKey: ['competences'] })
      setShowCreateCompetence(false)
      setCreateForm({ code: '', name: '', description: '', creditValue: 1 })
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  })

  const awardBadgeMutation = useMutation({
    mutationFn: () => competencesService.awardBadge(selectedBadge?.id, { studentId: awardForm.studentId, comment: awardForm.comment }),
    onSuccess: () => {
      toast.success('Badge attribué !')
      queryClient.invalidateQueries({ queryKey: ['my-badges'] })
      setShowAwardBadge(false)
      setAwardForm({ studentId: '', comment: '' })
      setSelectedBadge(null)
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  })

  const acquiredCodes = new Set(portfolio.map(p => p.competenceCode || p.competence?.code))
  const myBadgeIds = new Set(myBadges.map(b => b.badgeId || b.badge?.id || b.id))

  return (
    <div className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter">
            Compétences & <span className="text-primary">BADGES</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-medium italic opacity-70">
            Référentiel de compétences, certifications numériques et badges d'excellence.
          </p>
        </div>
        {(isAdmin || isTeacher) && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateCompetence(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nouvelle Compétence
            </button>
          </div>
        )}
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Compétences Totales', value: loadingCompetences ? '—' : competences.length, icon: Target, color: 'indigo' },
          { label: 'Acquises', value: loadingPortfolio ? '—' : portfolio.length, icon: Check, color: 'emerald' },
          { label: 'Badges Catalogue', value: loadingBadges ? '—' : badges.length, icon: Award, color: 'amber' },
          { label: 'Mes Badges', value: loadingMyBadges ? '—' : myBadges.length, icon: Trophy, color: 'rose' },
        ].map((s, i) => (
          <GlassCard key={i} className="p-6 border-none ring-1 ring-(--glass-border) relative overflow-hidden">
            <div className={`w-10 h-10 rounded-xl bg-${s.color}-500/10 flex items-center justify-center text-${s.color}-500 mb-3`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black italic">{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Competences List */}
        <div className="xl:col-span-2 space-y-6">
          <h2 className="text-xl font-black italic tracking-tight px-1">Référentiel des Compétences</h2>
          {loadingCompetences ? (
            <div className="flex flex-col items-center py-16 gap-4 opacity-40">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-xs font-black uppercase tracking-widest italic">Chargement...</p>
            </div>
          ) : competences.length === 0 ? (
            <div className="py-16 text-center glass-card opacity-40 rounded-3xl border-(--glass-border)">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="text-sm font-black italic uppercase tracking-widest">Aucune compétence définie.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {competences.map((comp, i) => {
                const acquisition = portfolio.find(p =>
                  (p.competenceCode || p.competence?.code) === comp.code ||
                  (p.competenceId || p.competence?.id) === comp.id
                )
                const isAcquired = !!acquisition

                return (
                  <motion.div
                    key={comp.id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={cn(
                      "p-5 rounded-3xl border transition-all group",
                      isAcquired
                        ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40"
                        : "bg-slate-50/50 dark:bg-slate-900/30 border-(--glass-border) hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm",
                          isAcquired ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                        )}>
                          {isAcquired ? <Check className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm tracking-tight">{comp.name}</h4>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mt-0.5">{comp.code}</p>
                          {comp.description && (
                            <p className="text-[11px] opacity-50 mt-1 italic line-clamp-1">{comp.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {acquisition?.level && (
                          <span className={cn("text-[9px] font-black uppercase px-2 py-1 rounded-lg", LEVEL_COLORS[acquisition.level] || 'text-slate-400 bg-slate-400/10')}>
                            {LEVEL_LABELS[acquisition.level] || acquisition.level}
                          </span>
                        )}
                        {comp.creditValue && (
                          <span className="text-[9px] font-black uppercase text-amber-500 opacity-70">{comp.creditValue} crédits</span>
                        )}
                      </div>
                    </div>
                    {acquisition?.level && (
                      <div className="mt-4 ml-14">
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${LEVEL_PROGRESS[acquisition.level] || 0}%` }}
                            transition={{ duration: 1, delay: i * 0.04 + 0.3 }}
                            className="h-full rounded-full bg-emerald-500 shadow-sm"
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Badges Sidebar */}
        <div className="space-y-8">
          {/* My Badges */}
          <GlassCard title="Mes Badges" className="border-none ring-1 ring-(--glass-border) shadow-xl shadow-black/5">
            <div className="pt-4 space-y-4">
              {loadingMyBadges ? (
                <div className="flex justify-center py-6 opacity-40"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : myBadges.length === 0 ? (
                <div className="py-6 text-center opacity-40">
                  <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-xs font-black italic uppercase tracking-widest">Aucun badge encore.</p>
                </div>
              ) : (
                myBadges.map((award, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/30 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black uppercase tracking-tight truncate">{award.badgeName || award.badge?.name || `Badge #${award.badgeId}`}</p>
                      <p className="text-[9px] opacity-40 italic mt-0.5">{award.awardedAt ? new Date(award.awardedAt).toLocaleDateString('fr-FR') : ''}</p>
                    </div>
                    <Zap className="w-4 h-4 text-amber-500 opacity-60 shrink-0" />
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          {/* Badge Catalogue */}
          <GlassCard title="Catalogue des Badges" className="border-none ring-1 ring-(--glass-border) shadow-xl shadow-black/5">
            <div className="pt-4 space-y-3">
              {loadingBadges ? (
                <div className="flex justify-center py-6 opacity-40"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
              ) : badges.length === 0 ? (
                <p className="text-xs opacity-40 italic text-center py-4">Aucun badge disponible.</p>
              ) : (
                badges.map((badge, i) => {
                  const owned = myBadgeIds.has(badge.id)
                  return (
                    <div key={i} className={cn("flex items-center gap-3 p-3 rounded-2xl transition-all", owned ? "opacity-50" : "hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-pointer")}>
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Star className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black uppercase tracking-tight truncate">{badge.name}</p>
                        {badge.description && <p className="text-[9px] opacity-40 italic truncate">{badge.description}</p>}
                      </div>
                      {owned ? (
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (isAdmin || isTeacher) && (
                        <button
                          onClick={() => { setSelectedBadge(badge); setShowAwardBadge(true) }}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-all active:scale-90"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </GlassCard>

          {/* Auto-badge info */}
          <div className="premium-gradient p-6 rounded-3xl text-white relative overflow-hidden">
            <Trophy className="w-10 h-10 mb-3 opacity-60" />
            <h3 className="font-black italic text-lg">Auto-Badge Actif</h3>
            <p className="text-sm opacity-80 mt-1 font-medium">
              Un badge est attribué automatiquement dès que vous validez <span className="font-black">5 compétences</span>.
            </p>
            <div className="mt-4 bg-white/10 rounded-2xl px-4 py-2 text-xs font-black uppercase tracking-widest">
              {portfolio.length} / 5 compétences validées
            </div>
          </div>
        </div>
      </div>

      {/* Modal — Créer Compétence */}
      {showCreateCompetence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card border border-(--glass-border) rounded-3xl p-8 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black italic tracking-tight">Nouvelle Compétence</h2>
              <button onClick={() => setShowCreateCompetence(false)} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <X className="w-5 h-5 opacity-60" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Code unique</label>
                <input
                  type="text"
                  placeholder="Ex: REACT-ADVANCED"
                  value={createForm.code}
                  onChange={e => setCreateForm({ ...createForm, code: e.target.value })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Nom</label>
                <input
                  type="text"
                  placeholder="Ex: React.js Avancé"
                  value={createForm.name}
                  onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Description de la compétence..."
                  value={createForm.description}
                  onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none resize-none bg-transparent"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Valeur en crédits</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={createForm.creditValue}
                  onChange={e => setCreateForm({ ...createForm, creditValue: parseInt(e.target.value) || 1 })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateCompetence(false)}
                className="flex-1 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-primary/30 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={() => createCompetenceMutation.mutate()}
                disabled={!createForm.code || !createForm.name || createCompetenceMutation.isPending}
                className="flex-1 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createCompetenceMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Créer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal — Attribuer Badge */}
      {showAwardBadge && selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card border border-(--glass-border) rounded-3xl p-8 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black italic tracking-tight">Attribuer le Badge</h2>
                <p className="text-xs opacity-50 italic mt-1">{selectedBadge.name}</p>
              </div>
              <button onClick={() => { setShowAwardBadge(false); setSelectedBadge(null) }} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <X className="w-5 h-5 opacity-60" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">ID Étudiant</label>
                <input
                  type="number"
                  placeholder="Ex: 42"
                  value={awardForm.studentId}
                  onChange={e => setAwardForm({ ...awardForm, studentId: e.target.value })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none bg-transparent"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Commentaire (optionnel)</label>
                <textarea
                  rows={3}
                  placeholder="Raison d'attribution..."
                  value={awardForm.comment}
                  onChange={e => setAwardForm({ ...awardForm, comment: e.target.value })}
                  className="w-full mt-1 p-4 rounded-2xl glass-card border border-(--glass-border) focus:border-primary/50 text-sm font-medium outline-none resize-none bg-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowAwardBadge(false); setSelectedBadge(null) }}
                className="flex-1 py-3 rounded-2xl glass-card border-(--glass-border) font-black text-xs uppercase tracking-widest hover:border-primary/30 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={() => awardBadgeMutation.mutate()}
                disabled={!awardForm.studentId || awardBadgeMutation.isPending}
                className="flex-1 py-3 rounded-2xl bg-amber-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/30 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {awardBadgeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                Attribuer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
