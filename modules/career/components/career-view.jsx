'use client'

import { motion } from 'framer-motion'
import { Briefcase, MapPin, Building2, Clock, Sparkles, FileText, CheckCircle, TrendingUp, Calendar, ArrowUpRight, Bookmark, Loader2, Plus } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useAuth } from '@/hooks/use-auth-hook'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { careerService } from '@/lib/career-service'
import { formatDateFr } from '@/lib/api-helpers'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

const OFFER_TYPE_COLORS = {
  INTERNSHIP: 'text-indigo-500 bg-indigo-500/10',
  FULL_TIME: 'text-emerald-500 bg-emerald-500/10',
  PART_TIME: 'text-amber-500 bg-amber-500/10',
  FREELANCE: 'text-purple-500 bg-purple-500/10',
  CONTRACT: 'text-blue-500 bg-blue-500/10',
}

const OFFER_TYPE_LABELS = {
  INTERNSHIP: 'Stage',
  FULL_TIME: 'CDI',
  PART_TIME: 'Temps partiel',
  FREELANCE: 'Freelance',
  CONTRACT: 'CDD',
}

export function CareerModuleView() {
  const { isAdmin, user } = useAuth()
  const queryClient = useQueryClient()
  const studentId = user?.id || user?.userId

  const { data: offers = [], isLoading: loadingOffers } = useQuery({
    queryKey: ['career-offers'],
    queryFn: () => careerService.getOffers({ status: 'ACTIVE' }),
  })

  const { data: applications = [], isLoading: loadingApps } = useQuery({
    queryKey: ['career-applications', studentId],
    queryFn: () => careerService.getStudentApplications(studentId),
    enabled: !!studentId,
  })

  const applyMutation = useMutation({
    mutationFn: careerService.applyToOffer,
    onSuccess: () => {
      toast.success('Candidature envoyée !')
      queryClient.invalidateQueries({ queryKey: ['career-applications', studentId] })
    },
    onError: err => toast.error(`Erreur: ${err.message}`),
  })

  const appliedOfferIds = new Set(applications.map(a => a.offerId || a.offer?.id))

  return (
    <div className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter">Espace <span className="text-primary">Carrière</span></h1>
          <p className="text-muted-foreground mt-2 font-medium italic opacity-70">Propulsez votre avenir professionnel avec nos opportunités exclusives.</p>
        </div>
        <div className="flex gap-3">
          {!isAdmin && (
            <button className="px-6 py-3 rounded-2xl glass-card font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all border-(--glass-border)">Mon CV</button>
          )}
          <button className="px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {isAdmin ? 'Publier une offre' : 'Nouvelle candidature'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Job Board */}
        <div className="xl:col-span-2 space-y-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black italic tracking-tight">Opportunités Actives</h2>
            <span className="text-xs font-black opacity-40 uppercase tracking-widest italic">{offers.length} offres</span>
          </div>

          {loadingOffers ? (
            <div className="flex flex-col items-center py-10 gap-4 opacity-40">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs font-black uppercase tracking-widest italic">Chargement offres...</p>
            </div>
          ) : offers.length === 0 ? (
            <div className="py-10 text-center glass-card opacity-40 rounded-3xl border-(--glass-border)">
              <p className="text-sm font-black italic uppercase tracking-widest">Aucune offre disponible.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {offers.map((job, i) => {
                const hasApplied = appliedOfferIds.has(job.id)
                return (
                  <GlassCard key={job.id || i} className="p-5 border-none ring-1 ring-(--glass-border) relative overflow-hidden group hover:ring-primary/40 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-2xl group-hover:scale-105 transition-transform shadow-lg shadow-black/5">
                          {job.companyName?.[0] || '🏢'}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{job.title}</h4>
                          <div className="flex flex-wrap items-center gap-3 mt-1 opacity-60">
                            <div className="flex items-center gap-1.5 text-xs font-medium"><Building2 className="w-3.5 h-3.5" /><span>{job.companyName}</span></div>
                            {job.location && <div className="flex items-center gap-1.5 text-xs font-medium"><MapPin className="w-3.5 h-3.5" /><span>{job.location}</span></div>}
                          </div>
                        </div>
                      </div>
                      <Bookmark className="w-5 h-5 opacity-20 hover:opacity-100 hover:text-primary transition-all cursor-pointer shrink-0" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-6">
                      <span className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase", OFFER_TYPE_COLORS[job.offerType] || 'text-slate-400 bg-slate-400/10')}>
                        {OFFER_TYPE_LABELS[job.offerType] || job.offerType}
                      </span>
                      {job.duration && <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black tracking-widest uppercase opacity-60">{job.duration}</span>}
                      <div className="flex-1" />
                      {job.applicationDeadline && <p className="text-[10px] italic font-medium opacity-40 uppercase">Deadline: {formatDateFr(job.applicationDeadline)}</p>}
                    </div>
                    {job.description && <p className="mt-4 text-xs opacity-60 leading-relaxed line-clamp-2">{job.description}</p>}
                    {!isAdmin && (
                      <button
                        onClick={() => !hasApplied && applyMutation.mutate(job.id)}
                        disabled={hasApplied || applyMutation.isPending}
                        className={cn("mt-4 w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95",
                          hasApplied ? "bg-emerald-500/10 text-emerald-500 cursor-default" : "bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/40"
                        )}
                      >
                        {hasApplied ? <><CheckCircle className="w-4 h-4" /> Candidature envoyée</> : applyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowUpRight className="w-4 h-4" /> Postuler maintenant</>}
                      </button>
                    )}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-4xl group-hover:bg-primary/10 transition-colors" />
                  </GlassCard>
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <GlassCard title="Mes Candidatures" className="border-none ring-1 ring-(--glass-border) shadow-xl shadow-black/5">
            <div className="space-y-4 pt-4">
              {loadingApps ? (
                <div className="flex justify-center py-6 opacity-40"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : applications.length === 0 ? (
                <p className="text-xs opacity-40 italic text-center py-6">Aucune candidature.</p>
              ) : applications.map((app, i) => (
                <div key={app.id || i} className="flex gap-3 items-start">
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                    app.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-500' : app.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                  )}>
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-black uppercase tracking-widest">{app.offerTitle || app.offer?.title || `Offre #${app.offerId}`}</p>
                    <span className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded-md mt-1 inline-block",
                      app.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-700' : app.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-700' : 'bg-amber-500/20 text-amber-700'
                    )}>{app.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <div className="premium-gradient p-8 rounded-3xl text-white relative overflow-hidden group">
            <TrendingUp className="w-12 h-12 mb-4 opacity-50 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black italic">Market Insights</h3>
            <p className="text-sm opacity-80 mt-2 font-medium">Les profils "Data Science" sont en hausse de <span className="font-black italic">22%</span> ce trimestre.</p>
            <button className="mt-6 px-5 py-2.5 bg-white text-primary rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">En savoir plus</button>
            <div className="absolute right-[-10px] bottom-[-10px] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
