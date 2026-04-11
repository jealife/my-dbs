'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, MapPin, Building2, Sparkles, FileText, CheckCircle,
  TrendingUp, ArrowUpRight, Bookmark, Loader2, Plus, X,
  Clock, Code2, Globe, Github, ChevronDown, FolderOpen
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useAuth } from '@/hooks/use-auth-hook'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { careerService } from '@/lib/career-service'
import { formatDateFr } from '@/lib/api-helpers'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useState } from 'react'
import { MaintenanceZone } from '@/components/ui/maintenance-zone'

// ── Constants ─────────────────────────────────────────────────────────────────
const OFFER_TYPES = [
  { id: 'INTERNSHIP',   label: 'Stage',      color: 'text-indigo-500 bg-indigo-500/10' },
  { id: 'JOB',          label: 'CDI / Emploi', color: 'text-emerald-500 bg-emerald-500/10' },
  { id: 'APPRENTICESHIP', label: 'Alternance', color: 'text-amber-500 bg-amber-500/10' },
]
const OFFER_TYPE_MAP = Object.fromEntries(OFFER_TYPES.map(t => [t.id, t]))

const APP_STATUS_STYLES = {
  SUBMITTED:    'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  UNDER_REVIEW: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  INTERVIEW:    'bg-purple-500/20 text-purple-700 dark:text-purple-300',
  ACCEPTED:     'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  REJECTED:     'bg-rose-500/20 text-rose-700 dark:text-rose-300',
  WITHDRAWN:    'bg-slate-500/20 text-slate-600 dark:text-slate-300',
}
const APP_STATUS_LABELS = {
  SUBMITTED: 'Envoyée', UNDER_REVIEW: 'En cours', INTERVIEW: 'Entretien',
  ACCEPTED: 'Acceptée', REJECTED: 'Refusée', WITHDRAWN: 'Retirée',
}

const EMPTY_OFFER = { title: '', company: '', location: '', offerType: 'INTERNSHIP', description: '', deadline: '', contactEmail: '' }
const EMPTY_PROJECT = { title: '', description: '', technologies: '', projectUrl: '', repositoryUrl: '', publiclyVisible: false }

// ── Main Component ─────────────────────────────────────────────────────────────
export function CareerModuleView() {
  const { isAdmin, isScolarity, user } = useAuth()
  const canManage = isAdmin || isScolarity
  const queryClient = useQueryClient()
  const studentId   = user?.id

  // Modals
  const [showNewOffer,    setShowNewOffer]    = useState(false)
  const [showNewProject,  setShowNewProject]  = useState(false)
  const [offerForm,       setOfferForm]       = useState(EMPTY_OFFER)
  const [projectForm,     setProjectForm]     = useState(EMPTY_PROJECT)
  const [filterType,      setFilterType]      = useState('')
  const [closingId,       setClosingId]       = useState(null)
  const [expandedApps,    setExpandedApps]    = useState(null)  // offerId whose apps are shown

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: offers = [], isLoading: loadingOffers, error: offersError, refetch: refetchOffers } = useQuery({
    queryKey: ['career-offers', filterType],
    queryFn:  () => careerService.getOffers(filterType ? { type: filterType } : {}),
  })

  const { data: applications = [], isLoading: loadingApps } = useQuery({
    queryKey: ['career-applications', studentId],
    queryFn:  () => careerService.getStudentApplications(studentId),
    enabled:  !!studentId,
  })

  const { data: portfolio = [], isLoading: loadingPortfolio } = useQuery({
    queryKey: ['career-portfolio', studentId],
    queryFn:  () => careerService.getPortfolio(studentId),
    enabled:  !!studentId && !canManage,
  })

  const { data: offerApps = [], isLoading: loadingOfferApps } = useQuery({
    queryKey: ['career-offer-apps', expandedApps],
    queryFn:  () => careerService.getOfferApplications(expandedApps),
    enabled:  canManage && !!expandedApps,
  })

  // ── Mutations ────────────────────────────────────────────────────────────────
  const createOfferMutation = useMutation({
    mutationFn: () => careerService.createOffer({
      postedById:  user?.id,
      title:       offerForm.title,
      company:     offerForm.company,
      description: offerForm.description,
      offerType:   offerForm.offerType,
      location:    offerForm.location   || undefined,
      deadline:    offerForm.deadline   || undefined,
      contactEmail: offerForm.contactEmail || undefined,
    }),
    onSuccess: () => {
      toast.success('Offre publiée !')
      queryClient.invalidateQueries({ queryKey: ['career-offers'] })
      setShowNewOffer(false)
      setOfferForm(EMPTY_OFFER)
    },
    onError: err => toast.error(`Erreur: ${err.message}`),
  })

  const applyMutation = useMutation({
    mutationFn: (offerId) => careerService.applyToOffer(offerId, studentId),
    onSuccess: () => {
      toast.success('Candidature envoyée !')
      queryClient.invalidateQueries({ queryKey: ['career-applications', studentId] })
    },
    onError: err => toast.error(`Erreur: ${err.response?.data?.message || err.message}`),
  })

  const closeMutation = useMutation({
    mutationFn: (offerId) => careerService.closeOffer(offerId),
    onSuccess: () => {
      toast.success('Offre clôturée.')
      setClosingId(null)
      queryClient.invalidateQueries({ queryKey: ['career-offers'] })
    },
    onError: err => toast.error(`Erreur: ${err.message}`),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ appId, status }) => careerService.updateApplicationStatus(appId, status),
    onSuccess: () => {
      toast.success('Statut mis à jour.')
      queryClient.invalidateQueries({ queryKey: ['career-offer-apps', expandedApps] })
    },
    onError: err => toast.error(`Erreur: ${err.message}`),
  })

  const addProjectMutation = useMutation({
    mutationFn: () => careerService.addPortfolioProject({
      studentId,
      title:           projectForm.title,
      description:     projectForm.description    || undefined,
      technologies:    projectForm.technologies   || undefined,
      projectUrl:      projectForm.projectUrl     || undefined,
      repositoryUrl:   projectForm.repositoryUrl  || undefined,
      publiclyVisible: projectForm.publiclyVisible,
    }),
    onSuccess: () => {
      toast.success('Projet ajouté au portfolio !')
      queryClient.invalidateQueries({ queryKey: ['career-portfolio', studentId] })
      setShowNewProject(false)
      setProjectForm(EMPTY_PROJECT)
    },
    onError: err => toast.error(`Erreur: ${err.message}`),
  })

  // ── Derived state ────────────────────────────────────────────────────────────
  const appliedOfferIds = new Set(
    applications.map(a => a.jobOffer?.id || a.jobOfferId || a.offerId)
  )

  if (offersError) return (
    <div className="p-8">
      <MaintenanceZone error={offersError} reset={refetchOffers} zone="Espace Carrière" />
    </div>
  )

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-4">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter">Espace <span className="text-primary">Carrière</span></h1>
          <p className="text-muted-foreground mt-2 font-medium italic opacity-70">
            Propulsez votre avenir professionnel avec nos opportunités exclusives.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {!canManage && (
            <button
              onClick={() => setShowNewProject(true)}
              className="px-5 py-3 rounded-2xl glass-card font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all border-(--glass-border) flex items-center gap-2"
            >
              <Code2 className="w-4 h-4" /> Mon Portfolio
            </button>
          )}
          {canManage && (
            <button
              onClick={() => setShowNewOffer(true)}
              className="px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Publier une offre
            </button>
          )}
        </div>
      </header>

      {/* Type filter pills */}
      <div className="flex flex-wrap gap-2">
        {[{ id: '', label: 'Toutes' }, ...OFFER_TYPES].map(t => (
          <button key={t.id} onClick={() => setFilterType(t.id)}
            className={cn(
              'px-4 py-2 rounded-xl ring-1 font-black text-[11px] uppercase tracking-wider transition-all whitespace-nowrap',
              filterType === t.id
                ? 'ring-primary/50 bg-primary/5 text-primary'
                : 'ring-(--glass-border) hover:ring-primary/30'
            )}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Job board */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-black italic tracking-tight">Opportunités Actives</h2>
            <span className="text-xs font-black opacity-40 uppercase tracking-widest italic">{offers.length} offres</span>
          </div>

          {loadingOffers ? (
            <div className="flex flex-col items-center py-12 gap-4 opacity-40">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs font-black uppercase tracking-widest italic">Chargement...</p>
            </div>
          ) : offers.length === 0 ? (
            <div className="py-14 text-center glass-card opacity-40 rounded-3xl border-(--glass-border)">
              <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-black italic uppercase tracking-widest">Aucune offre disponible.</p>
            </div>
          ) : offers.map((job, i) => {
            const hasApplied = appliedOfferIds.has(job.id)
            const typeMeta   = OFFER_TYPE_MAP[job.offerType]
            return (
              <motion.div key={job.id || i}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              >
                <GlassCard className="p-5 border-none ring-1 ring-(--glass-border) relative overflow-hidden group hover:ring-primary/40 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xl shrink-0 group-hover:scale-105 transition-transform">
                        {job.companyName?.[0]?.toUpperCase() || '🏢'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-base leading-tight group-hover:text-primary transition-colors truncate">{job.title}</h4>
                        <div className="flex flex-wrap items-center gap-3 mt-1 opacity-60">
                          <div className="flex items-center gap-1.5 text-xs font-medium">
                            <Building2 className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{job.companyName}</span>
                          </div>
                          {job.location && (
                            <div className="flex items-center gap-1.5 text-xs font-medium">
                              <MapPin className="w-3.5 h-3.5 shrink-0" /><span>{job.location}</span>
                            </div>
                          )}
                          {job.remotePossible && (
                            <span className="text-[10px] font-black text-emerald-500">🌐 Remote</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Bookmark className="w-5 h-5 opacity-20 hover:opacity-100 hover:text-primary transition-all cursor-pointer shrink-0" />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    {typeMeta && (
                      <span className={cn('px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase', typeMeta.color)}>
                        {typeMeta.label}
                      </span>
                    )}
                    {job.durationMonths && (
                      <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black tracking-widest uppercase opacity-60">
                        {job.durationMonths} mois
                      </span>
                    )}
                    <div className="flex-1" />
                    {job.applicationDeadline && (
                      <p className="text-[10px] italic font-medium opacity-40 uppercase">
                        <Clock className="w-3 h-3 inline mr-1" />Deadline: {formatDateFr(job.applicationDeadline)}
                      </p>
                    )}
                  </div>

                  {job.description && (
                    <p className="mt-3 text-xs opacity-60 leading-relaxed line-clamp-2">{job.description}</p>
                  )}

                  {/* Student: apply button */}
                  {!canManage && (
                    <button
                      onClick={() => !hasApplied && applyMutation.mutate(job.id)}
                      disabled={hasApplied || applyMutation.isPending}
                      className={cn(
                        'mt-4 w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95',
                        hasApplied
                          ? 'bg-emerald-500/10 text-emerald-500 cursor-default'
                          : 'bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/40'
                      )}
                    >
                      {hasApplied
                        ? <><CheckCircle className="w-4 h-4" /> Candidature envoyée</>
                        : applyMutation.isPending
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <><ArrowUpRight className="w-4 h-4" /> Postuler maintenant</>
                      }
                    </button>
                  )}

                  {/* Admin: close offer + view applications */}
                  {canManage && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => setExpandedApps(expandedApps === job.id ? null : job.id)}
                        className="flex-1 py-2.5 rounded-2xl bg-primary/10 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" /> Candidatures
                        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', expandedApps === job.id && 'rotate-180')} />
                      </button>
                      {closingId === job.id ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => closeMutation.mutate(job.id)}
                            disabled={closeMutation.isPending}
                            className="px-3 py-2.5 rounded-2xl bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
                          >
                            {closeMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirmer'}
                          </button>
                          <button onClick={() => setClosingId(null)} className="px-3 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 font-black text-[10px]">
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setClosingId(job.id)}
                          className="px-4 py-2.5 rounded-2xl bg-rose-500/10 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500/20 transition-colors"
                        >
                          Clôturer
                        </button>
                      )}
                    </div>
                  )}

                  {/* Expandable applications list (admin) */}
                  <AnimatePresence>
                    {canManage && expandedApps === job.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-(--glass-border) space-y-2">
                          {loadingOfferApps ? (
                            <div className="flex justify-center py-4 opacity-40"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
                          ) : offerApps.length === 0 ? (
                            <p className="text-xs opacity-40 italic text-center py-4">Aucune candidature reçue.</p>
                          ) : offerApps.map(app => (
                            <div key={app.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                              <div className="flex items-center gap-2 min-w-0">
                                {app.studentPhotoUrl ? (
                                  <img src={app.studentPhotoUrl} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black shrink-0">
                                    {app.studentFirstName?.[0]?.toUpperCase() || '?'}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-bold truncate">
                                    {app.studentFirstName && app.studentLastName
                                      ? `${app.studentFirstName} ${app.studentLastName}`
                                      : `Étudiant #${app.studentId}`}
                                  </p>
                                  <p className="text-[10px] opacity-50 truncate">{app.studentEmail || formatDateFr(app.appliedAt || app.createdAt)}</p>
                                </div>
                              </div>
                              <select
                                value={app.status || ''}
                                onChange={e => updateStatusMutation.mutate({ appId: app.id, status: e.target.value })}
                                className="text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-white dark:bg-slate-800 ring-1 ring-(--glass-border) outline-none"
                              >
                                {Object.entries(APP_STATUS_LABELS).map(([v, l]) => (
                                  <option key={v} value={v}>{l}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-4xl group-hover:bg-primary/10 transition-colors" />
                </GlassCard>
              </motion.div>
            )
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* My Applications (student) */}
          {!canManage && (
            <GlassCard title="Mes Candidatures" className="border-none ring-1 ring-(--glass-border) shadow-xl shadow-black/5">
              <div className="space-y-3 pt-4">
                {loadingApps ? (
                  <div className="flex justify-center py-6 opacity-40"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : applications.length === 0 ? (
                  <p className="text-xs opacity-40 italic text-center py-6">Aucune candidature.</p>
                ) : applications.map((app, i) => (
                  <div key={app.id || i} className="flex gap-3 items-start p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                      app.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-500' :
                      app.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                    )}>
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-widest truncate">
                        {app.jobOffer?.title || `Offre #${app.jobOffer?.id || app.jobOfferId}`}
                      </p>
                      <span className={cn('text-[8px] font-black uppercase px-2 py-0.5 rounded-md mt-1 inline-block', APP_STATUS_STYLES[app.status])}>
                        {APP_STATUS_LABELS[app.status] || app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Portfolio (student) */}
          {!canManage && (
            <GlassCard className="border-none ring-1 ring-(--glass-border) shadow-xl shadow-black/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                  <FolderOpen className="w-3.5 h-3.5" /> Mon Portfolio
                </h3>
                <button
                  onClick={() => setShowNewProject(true)}
                  className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              {loadingPortfolio ? (
                <div className="flex justify-center py-4 opacity-40"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
              ) : portfolio.length === 0 ? (
                <div className="py-6 text-center opacity-40">
                  <Code2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-medium italic">Aucun projet ajouté.</p>
                </div>
              ) : portfolio.map((p, i) => (
                <div key={p.id || i} className="mb-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                  <p className="text-[11px] font-black uppercase tracking-widest">{p.title}</p>
                  {p.technologies && (
                    <p className="text-[10px] opacity-50 mt-0.5 font-medium">{p.technologies}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    {p.projectUrl && (
                      <a href={p.projectUrl} target="_blank" className="text-[10px] text-primary flex items-center gap-1 font-bold hover:opacity-70 transition-opacity">
                        <Globe className="w-3 h-3" /> Démo
                      </a>
                    )}
                    {p.repositoryUrl && (
                      <a href={p.repositoryUrl} target="_blank" className="text-[10px] text-primary flex items-center gap-1 font-bold hover:opacity-70 transition-opacity">
                        <Github className="w-3 h-3" /> Code
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </GlassCard>
          )}

          {/* Market Insights */}
          <div className="premium-gradient p-8 rounded-3xl text-white relative overflow-hidden group">
            <TrendingUp className="w-12 h-12 mb-4 opacity-50 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black italic">Market Insights</h3>
            <p className="text-sm opacity-80 mt-2 font-medium">
              Les profils <span className="font-black italic">&quot;Data Science&quot;</span> sont en hausse de{' '}
              <span className="font-black italic">22%</span> ce trimestre.
            </p>
            <div className="absolute right-[-10px] bottom-[-10px] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>

      {/* ════════════ MODAL — Publier une offre ════════════ */}
      <AnimatePresence>
        {showNewOffer && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowNewOffer(false) }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black italic tracking-tight">Publier une Offre</h2>
                <button onClick={() => setShowNewOffer(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5 opacity-60" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Titre */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5">Titre du poste *</label>
                  <input type="text" placeholder="Ex: Développeur Full-Stack" value={offerForm.title}
                    onChange={e => setOfferForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 ring-1 ring-(--glass-border) focus:ring-primary/50 text-sm font-medium outline-none" />
                </div>
                {/* Entreprise */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5">Entreprise *</label>
                  <input type="text" placeholder="Nom de l'entreprise" value={offerForm.company}
                    onChange={e => setOfferForm(p => ({ ...p, company: e.target.value }))}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 ring-1 ring-(--glass-border) focus:ring-primary/50 text-sm font-medium outline-none" />
                </div>
                {/* Localisation */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5">Localisation</label>
                  <input type="text" placeholder="Ex: Libreville, Gabon" value={offerForm.location}
                    onChange={e => setOfferForm(p => ({ ...p, location: e.target.value }))}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 ring-1 ring-(--glass-border) focus:ring-primary/50 text-sm font-medium outline-none" />
                </div>
                {/* Type */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5">Type d&apos;offre *</label>
                  <select value={offerForm.offerType}
                    onChange={e => setOfferForm(p => ({ ...p, offerType: e.target.value }))}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 ring-1 ring-(--glass-border) focus:ring-primary/50 text-sm font-medium outline-none">
                    {OFFER_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                {/* Deadline */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5">Date limite</label>
                  <input type="date" value={offerForm.deadline}
                    onChange={e => setOfferForm(p => ({ ...p, deadline: e.target.value }))}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 ring-1 ring-(--glass-border) focus:ring-primary/50 text-sm font-medium outline-none" />
                </div>
                {/* Email contact */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5">Email de contact</label>
                  <input type="email" placeholder="recrutement@entreprise.com" value={offerForm.contactEmail}
                    onChange={e => setOfferForm(p => ({ ...p, contactEmail: e.target.value }))}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 ring-1 ring-(--glass-border) focus:ring-primary/50 text-sm font-medium outline-none" />
                </div>
                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5">Description *</label>
                  <textarea rows={4} placeholder="Décrivez le poste, les missions et les compétences requises..."
                    value={offerForm.description}
                    onChange={e => setOfferForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 ring-1 ring-(--glass-border) focus:ring-primary/50 text-sm font-medium outline-none resize-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowNewOffer(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Annuler
                </button>
                <button
                  onClick={() => createOfferMutation.mutate()}
                  disabled={!offerForm.title || !offerForm.company || !offerForm.description || createOfferMutation.isPending}
                  className="flex-1 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createOfferMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
                  Publier
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════ MODAL — Ajouter un projet portfolio ════════════ */}
      <AnimatePresence>
        {showNewProject && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowNewProject(false) }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black italic tracking-tight">Ajouter un Projet</h2>
                <button onClick={() => setShowNewProject(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5 opacity-60" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5">Nom du projet *</label>
                  <input type="text" placeholder="Ex: Application de gestion scolaire" value={projectForm.title}
                    onChange={e => setProjectForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 ring-1 ring-(--glass-border) focus:ring-primary/50 text-sm font-medium outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5">Technologies</label>
                  <input type="text" placeholder="Ex: React, Node.js, PostgreSQL" value={projectForm.technologies}
                    onChange={e => setProjectForm(p => ({ ...p, technologies: e.target.value }))}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 ring-1 ring-(--glass-border) focus:ring-primary/50 text-sm font-medium outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5">URL Demo</label>
                    <input type="url" placeholder="https://..." value={projectForm.projectUrl}
                      onChange={e => setProjectForm(p => ({ ...p, projectUrl: e.target.value }))}
                      className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 ring-1 ring-(--glass-border) focus:ring-primary/50 text-sm font-medium outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5">GitHub / Repo</label>
                    <input type="url" placeholder="https://github.com/..." value={projectForm.repositoryUrl}
                      onChange={e => setProjectForm(p => ({ ...p, repositoryUrl: e.target.value }))}
                      className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 ring-1 ring-(--glass-border) focus:ring-primary/50 text-sm font-medium outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-1.5">Description</label>
                  <textarea rows={3} placeholder="Décrivez votre projet..."
                    value={projectForm.description}
                    onChange={e => setProjectForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 ring-1 ring-(--glass-border) focus:ring-primary/50 text-sm font-medium outline-none resize-none" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => setProjectForm(p => ({ ...p, publiclyVisible: !p.publiclyVisible }))}
                    className={cn(
                      'w-10 h-5 rounded-full transition-colors relative cursor-pointer',
                      projectForm.publiclyVisible ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                      projectForm.publiclyVisible && 'translate-x-5'
                    )} />
                  </div>
                  <span className="text-xs font-bold">Visible publiquement dans la vitrine</span>
                </label>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowNewProject(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Annuler
                </button>
                <button
                  onClick={() => addProjectMutation.mutate()}
                  disabled={!projectForm.title || addProjectMutation.isPending}
                  className="flex-1 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {addProjectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Ajouter
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
