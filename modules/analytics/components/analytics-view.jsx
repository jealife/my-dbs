'use client'

import { motion } from 'framer-motion'
import { Activity, TrendingUp, Brain, Zap, Users, Award, BarChart3, FileSearch, ArrowUpRight, Target, Clock, ChevronRight, Loader2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { analyticsService } from '@/lib/analytics-service'
import { userService } from '@/lib/user-service'
import { cn } from '@/lib/utils'
import { formatDateFr } from '@/lib/api-helpers'
import { toast } from 'react-hot-toast'

const ALERT_SEVERITY_STYLES = {
  CRITICAL: { badge: 'bg-red-500/20 text-red-700', border: 'border-rose-500/20', icon: '🔴' },
  HIGH: { badge: 'bg-orange-500/20 text-orange-700', border: 'border-orange-400/20', icon: '🟠' },
  MEDIUM: { badge: 'bg-amber-500/20 text-amber-700', border: 'border-amber-400/20', icon: '🟡' },
  LOW: { badge: 'bg-indigo-500/20 text-indigo-700', border: 'border-indigo-400/20', icon: '🔵' },
}

const ALERT_TYPE_LABELS = {
  ATTENDANCE_DROP: 'Chute d\'assiduité',
  GRADE_DROP: 'Chute de notes',
  RISK_DROPOUT: 'Risque décrochage',
  INACTIVITY: 'Inactivité détectée',
  OVERDUE_PAYMENT: 'Retard de paiement',
  PAYMENT_OVERDUE: 'Retard de paiement',
}

export function AnalyticsModuleView() {
  const queryClient = useQueryClient()

  const { data: alerts = [], isLoading: loadingAlerts, error: alertsError } = useQuery({
    queryKey: ['analytics-alerts'],
    queryFn: () => analyticsService.getOpenAlerts(),
  })

  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: () => userService.getStudents(),
  })

  const acknowledgeMutation = useMutation({
    mutationFn: analyticsService.acknowledgeAlert,
    onSuccess: () => { toast.success('Alerte prise en charge.'); queryClient.invalidateQueries({ queryKey: ['analytics-alerts'] }) },
    onError: err => toast.error(`Erreur: ${err.message}`),
  })

  const resolveMutation = useMutation({
    mutationFn: analyticsService.resolveAlert,
    onSuccess: () => { toast.success('Alerte résolue.'); queryClient.invalidateQueries({ queryKey: ['analytics-alerts'] }) },
    onError: err => toast.error(`Erreur: ${err.message}`),
  })

  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH')
  const mediumAlerts = alerts.filter(a => a.severity === 'MEDIUM' || a.severity === 'LOW')

  const stats = [
    { label: 'Total Étudiants', value: loadingStudents ? '—' : students.length.toLocaleString('fr-FR'), icon: Users, color: 'indigo' },
    { label: 'Alertes Ouvertes', value: loadingAlerts ? '—' : alerts.length, icon: AlertTriangle, color: 'rose' },
    { label: 'Alertes Critiques', value: loadingAlerts ? '—' : criticalAlerts.length, icon: Zap, color: 'amber' },
    { label: 'Résolues Aujourd\'hui', value: '—', icon: Target, color: 'emerald' },
  ]

  return (
    <div className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter">Analytics & <span className="text-primary italic">IA</span></h1>
          <p className="text-muted-foreground mt-2 font-medium italic opacity-70">Exploitez les données pour une meilleure gestion académique et la prévention du décrochage.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 rounded-2xl glass-card font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all border-(--glass-border)">Générer Rapport</button>
          <button className="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">Configuration IA</button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <GlassCard key={i} className="p-6 border-none ring-1 ring-(--glass-border) relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 rounded-2xl bg-${s.color}-500 flex items-center justify-center text-white shadow-xl shadow-${s.color}-500/20`}>
                <s.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-6">
              <p className="text-3xl font-black italic">{s.value}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">{s.label}</p>
            </div>
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${s.color}-500/5 rounded-full -mr-16 -mt-16 blur-4xl`} />
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Alerts Main Area */}
        <div className="xl:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl font-black italic tracking-tight mb-6 px-1">Alertes Prioritaires</h2>
            {loadingAlerts ? (
              <div className="flex flex-col items-center py-20 gap-4 opacity-40">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-xs font-black uppercase tracking-widest italic text-primary">Analyse en cours...</p>
              </div>
            ) : alertsError ? (
              <div className="p-10 text-center text-rose-500 glass-card rounded-3xl border-(--glass-border)">
                <p className="text-sm font-black italic">⚠️ {alertsError.message}</p>
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-20 text-center glass-card opacity-40 rounded-3xl border-(--glass-border)">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-500 opacity-50" />
                <p className="text-sm font-black italic uppercase tracking-widest">Aucune alerte ouverte. Tout va bien !</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map(alert => {
                  const style = ALERT_SEVERITY_STYLES[alert.severity] || ALERT_SEVERITY_STYLES.LOW
                  return (
                    <motion.div key={alert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={cn("p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border relative overflow-hidden group hover:border-primary/40 transition-all", style.border)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className={cn("text-[9px] font-black uppercase px-2 py-1 rounded-md", style.badge)}>
                              {style.icon} {alert.severity}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest italic opacity-40">{ALERT_TYPE_LABELS[alert.alertType] || alert.alertType}</span>
                          </div>
                          <h4 className="text-sm font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">{alert.message || alert.description}</h4>
                          {alert.studentCode && (
                            <p className="text-[10px] opacity-40 font-medium italic">Étudiant : {alert.studentCode}</p>
                          )}
                          <p className="text-[10px] opacity-30 mt-1">{formatDateFr(alert.triggeredAt || alert.createdAt)}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => acknowledgeMutation.mutate(alert.id)}
                            disabled={acknowledgeMutation.isPending}
                            className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all font-black text-[9px] uppercase tracking-widest active:scale-95 disabled:opacity-50"
                          >
                            Prendre En Charge
                          </button>
                          <button
                            onClick={() => resolveMutation.mutate(alert.id)}
                            disabled={resolveMutation.isPending}
                            className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all font-black text-[9px] uppercase tracking-widest active:scale-95 disabled:opacity-50"
                          >
                            Résoudre
                          </button>
                        </div>
                      </div>
                      <Zap className="absolute right-[-10px] bottom-[-10px] w-12 h-12 opacity-5 text-primary group-hover:opacity-20 transition-opacity" />
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <GlassCard title="Répartition des Alertes" className="border-none ring-1 ring-(--glass-border) shadow-xl shadow-black/5">
            <div className="pt-4 space-y-4">
              {Object.entries(ALERT_SEVERITY_STYLES).map(([sev, style]) => {
                const count = alerts.filter(a => a.severity === sev).length
                const pct = alerts.length > 0 ? Math.round(count / alerts.length * 100) : 0
                return (
                  <div key={sev} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="opacity-60">{style.icon} {sev}</span>
                      <span>{count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className={cn("h-full rounded-full", sev === 'CRITICAL' ? 'bg-rose-500' : sev === 'HIGH' ? 'bg-orange-500' : sev === 'MEDIUM' ? 'bg-amber-500' : 'bg-indigo-500')} />
                    </div>
                  </div>
                )
              })}
            </div>
          </GlassCard>

          <div className="premium-gradient p-8 rounded-3xl text-white relative overflow-hidden group cursor-pointer">
            <Brain className="w-12 h-12 mb-4 opacity-70 group-hover:rotate-12 transition-transform" />
            <h3 className="text-xl font-black italic">Assistance Prédictive</h3>
            <p className="text-sm font-medium mt-2 opacity-80">Générez une prédiction du taux de diplomation pour l'année en cours.</p>
            <div className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform">
              Lancer AI Simulation <ArrowUpRight className="w-4 h-4" />
            </div>
            <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          </div>

          <GlassCard title="Activité Récente" className="border-none ring-1 ring-(--glass-border) shadow-xl shadow-black/5">
            <div className="space-y-4 pt-4">
              {loadingAlerts ? (
                <div className="flex justify-center py-4 opacity-40"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
              ) : alerts.slice(0, 5).map((a, i) => (
                <div key={i} className="flex items-center gap-4 text-xs">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold opacity-80 truncate">{ALERT_TYPE_LABELS[a.alertType] || a.alertType}</p>
                    <p className="font-medium opacity-40">{a.studentCode || 'Système'}</p>
                  </div>
                  <p className="text-[10px] font-black italic opacity-30">{formatDateFr(a.triggeredAt || a.createdAt)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-(--glass-border) flex items-center justify-between opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
              <span className="text-xs font-black uppercase tracking-widest">Logs Complets</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
