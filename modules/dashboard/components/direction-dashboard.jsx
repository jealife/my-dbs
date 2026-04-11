'use client'

import {
  TrendingUp, TrendingDown, Users, GraduationCap, BookOpen,
  AlertTriangle, CheckCircle2, Clock, RefreshCw, Download,
  BarChart3, ShieldAlert, CreditCard, Wallet, Activity,
  ChevronRight, Target, Zap, ArrowUpRight, ArrowDownRight,
  Bell, Flag, Eye
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { analyticsService } from '@/lib/analytics-service'
import Link from 'next/link'

// ─── Data fetchers ─────────────────────────────────────────────────────────────

async function fetchDirectionStats() {
  const [studentsRes, teachersRes, coursesRes, admissionsRes, financeRes] = await Promise.allSettled([
    apiClient.get('/students'),
    apiClient.get('/teachers'),
    apiClient.get('/v1/courses'),
    apiClient.get('/v1/admissions'),
    apiClient.get('/v1/finance/invoices'),
  ])

  const extract = (res) => {
    if (res.status !== 'fulfilled') return []
    const d = res.value.data?.data ?? res.value.data
    return Array.isArray(d) ? d : (d?.content ?? [])
  }

  const students   = extract(studentsRes)
  const teachers   = extract(teachersRes)
  const courses    = extract(coursesRes)
  const admissions = extract(admissionsRes)
  const invoices   = extract(financeRes)

  const activeStudents  = students.filter(s => s.status !== 'ARCHIVED' && !s.archived)
  const activeTeachers  = teachers.filter(t => t.status !== 'ARCHIVED' && !t.archived)
  const activeCourses   = courses.filter(c => c.status === 'PUBLISHED' || c.status === 'ACTIVE')
  const pendingAdm      = admissions.filter(a => ['SUBMITTED', 'UNDER_REVIEW'].includes(a.status))
  const unpaidInvoices  = invoices.filter(i => i.status === 'UNPAID' || i.status === 'OVERDUE')
  const paidInvoices    = invoices.filter(i => i.status === 'PAID')

  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.amount || inv.totalAmount || 0), 0)
  const totalUnpaid  = unpaidInvoices.reduce((sum, inv) => sum + (inv.amount || inv.totalAmount || 0), 0)
  const recoveryRate = invoices.length > 0
    ? Math.round((paidInvoices.length / invoices.length) * 100)
    : 0

  return {
    students: activeStudents.length,
    teachers: activeTeachers.length,
    courses: activeCourses.length,
    admissions: admissions.length,
    pendingAdm: pendingAdm.length,
    unpaidCount: unpaidInvoices.length,
    totalRevenue,
    totalUnpaid,
    recoveryRate,
    recentAdmissions: [...admissions]
      .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
      .slice(0, 5),
  }
}

async function fetchAlerts() {
  try {
    return await analyticsService.getOpenAlerts({ size: 10 })
  } catch {
    return []
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) => n >= 1_000_000
  ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n)

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—'

const statusColor = {
  SUBMITTED:    'text-blue-500 bg-blue-500/10',
  UNDER_REVIEW: 'text-amber-500 bg-amber-500/10',
  APPROVED:     'text-emerald-500 bg-emerald-500/10',
  REJECTED:     'text-rose-500 bg-rose-500/10',
  DRAFT:        'text-slate-400 bg-slate-400/10',
}
const statusLabel = {
  SUBMITTED:    'Soumis',
  UNDER_REVIEW: 'En cours',
  APPROVED:     'Approuvé',
  REJECTED:     'Rejeté',
  DRAFT:        'Brouillon',
}

const alertSeverityColor = {
  HIGH:     'text-rose-500 bg-rose-500/10 border-rose-500/20',
  MEDIUM:   'text-amber-500 bg-amber-500/10 border-amber-500/20',
  LOW:      'text-blue-500 bg-blue-500/10 border-blue-500/20',
  CRITICAL: 'text-red-600 bg-red-600/10 border-red-600/20',
}
const alertSeverityLabel = { HIGH: 'Haute', MEDIUM: 'Moyenne', LOW: 'Faible', CRITICAL: 'Critique' }

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon: Icon, color, trend, trendVal, loading, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <GlassCard className="relative overflow-hidden group border-none ring-1 ring-(--glass-border) hover:ring-primary/40 transition-all h-full">
        <div className="flex justify-between items-start mb-4">
          <div className={`${color} p-3 rounded-2xl shadow-xl shadow-slate-900/5 group-hover:scale-110 transition-transform duration-500`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend != null && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black ${trend >= 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trendVal}
            </div>
          )}
        </div>
        <div>
          {loading
            ? <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse mb-1" />
            : <p className="text-3xl font-black tracking-tight">{value ?? '—'}</p>
          }
          <p className="text-xs font-black opacity-40 uppercase tracking-widest mt-1">{label}</p>
          {sub && <p className="text-[10px] text-muted-foreground font-medium mt-1 opacity-60">{sub}</p>}
        </div>
        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-primary/10 transition-colors" />
      </GlassCard>
    </motion.div>
  )
}

function AlertItem({ alert, i }) {
  const severity = alert.severity || alert.alertSeverity || 'LOW'
  const colorClass = alertSeverityColor[severity] || alertSeverityColor.LOW

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.05 }}
      className={`flex items-start gap-3 p-4 rounded-2xl border ${colorClass} transition-all hover:scale-[1.01]`}
    >
      <Flag className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{alert.message || alert.description || 'Alerte système'}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
            {alert.alertType || alert.type || 'GENERAL'}
          </span>
          <span className="opacity-30">•</span>
          <span className="text-[9px] opacity-50">{fmtDate(alert.createdAt)}</span>
        </div>
      </div>
      <span className={`shrink-0 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${colorClass}`}>
        {alertSeverityLabel[severity] || severity}
      </span>
    </motion.div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'overview',  label: 'Vue Générale',   icon: BarChart3 },
  { key: 'alerts',    label: 'Alertes',         icon: Bell },
  { key: 'admissions',label: 'Admissions',      icon: GraduationCap },
  { key: 'finance',   label: 'Finance',         icon: Wallet },
]

// ─── Main component ───────────────────────────────────────────────────────────
export function DirectionDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('overview')

  const { data: stats, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['direction-dashboard-stats'],
    queryFn: fetchDirectionStats,
    staleTime: 60_000,
    refetchInterval: 180_000,
  })

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['direction-alerts'],
    queryFn: fetchAlerts,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const kpis = [
    {
      label: 'Étudiants Actifs',
      value: stats?.students,
      icon: GraduationCap,
      color: 'bg-indigo-500',
      trend: 1,
      trendVal: 'Actifs',
      sub: 'Inscrits cette année',
    },
    {
      label: 'Corps Enseignant',
      value: stats?.teachers,
      icon: Users,
      color: 'bg-emerald-500',
      trend: 1,
      trendVal: 'Actifs',
      sub: 'Enseignants en activité',
    },
    {
      label: 'Cours Actifs',
      value: stats?.courses,
      icon: BookOpen,
      color: 'bg-violet-500',
      sub: 'Publiés et en cours',
    },
    {
      label: 'Alertes Ouvertes',
      value: alertsLoading ? null : alerts.length,
      icon: AlertTriangle,
      color: alerts.length > 0 ? 'bg-rose-500' : 'bg-slate-400',
      sub: 'Nécessitent attention',
    },
    {
      label: 'Taux Recouvrement',
      value: stats?.recoveryRate != null ? `${stats.recoveryRate}%` : null,
      icon: TrendingUp,
      color: (stats?.recoveryRate ?? 0) >= 80 ? 'bg-emerald-500' : 'bg-amber-500',
      sub: 'Paiements encaissés',
    },
    {
      label: 'Candidatures',
      value: stats?.admissions,
      icon: Target,
      color: 'bg-amber-500',
      sub: `${stats?.pendingAdm ?? '…'} en attente`,
    },
  ]

  return (
    <div className="space-y-8 py-4 sm:py-8">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter italic">
            Tableau de Bord <span className="text-primary italic">DIRECTION</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60 text-sm">
            Bienvenue, <span className="text-foreground font-black">{user?.first_name || 'Direction'}</span>. Pilotage stratégique de l&apos;établissement.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-card font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all border-(--glass-border) disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <Link
            href="/analytics"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics Complets</span>
            <span className="sm:hidden">Analytics</span>
          </Link>
        </div>
      </header>

      {/* Alert banner if critical alerts */}
      {!alertsLoading && alerts.some(a => a.severity === 'CRITICAL' || a.severity === 'HIGH') && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500"
        >
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-black">
              {alerts.filter(a => ['CRITICAL', 'HIGH'].includes(a.severity)).length} alerte(s) critique(s) nécessitent votre attention immédiate.
            </p>
          </div>
          <button onClick={() => setActiveTab('alerts')} className="text-xs font-black uppercase tracking-widest underline underline-offset-4 shrink-0">
            Voir
          </button>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all shrink-0 ${
              activeTab === tab.key
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'glass-card border-(--glass-border) hover:border-primary/40 opacity-60 hover:opacity-100'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {tab.key === 'alerts' && alerts.length > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${activeTab === tab.key ? 'bg-white/20' : 'bg-rose-500/20 text-rose-500'}`}>
                {alerts.length}
              </span>
            )}
            {tab.key === 'admissions' && stats?.pendingAdm > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[9px]">{stats.pendingAdm}</span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── VUE GÉNÉRALE ── */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {kpis.map((kpi, i) => (
                <KpiCard key={i} {...kpi} loading={isLoading && i < 3} delay={i * 0.08} />
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Indicateurs clés */}
              <GlassCard className="xl:col-span-2 shadow-none border-none ring-1 ring-(--glass-border)" title="Indicateurs Clés" description="Vue consolidée des métriques institutionnelles.">
                <div className="space-y-4 pt-4">
                  {[
                    {
                      label: 'Occupation des cours',
                      value: isLoading ? null : stats?.students && stats?.courses ? `${Math.min(Math.round((stats.students / Math.max(stats.courses, 1)) * 3), 100)}%` : '—',
                      color: 'bg-indigo-500',
                      icon: BookOpen,
                    },
                    {
                      label: 'Recouvrement financier',
                      value: isLoading ? null : stats?.recoveryRate != null ? `${stats.recoveryRate}%` : '—',
                      color: (stats?.recoveryRate ?? 0) >= 80 ? 'bg-emerald-500' : 'bg-amber-500',
                      icon: CreditCard,
                    },
                    {
                      label: 'Dossiers de candidature traités',
                      value: isLoading ? null : stats?.admissions > 0 ? `${Math.round(((stats.admissions - stats.pendingAdm) / stats.admissions) * 100)}%` : '—',
                      color: 'bg-violet-500',
                      icon: Target,
                    },
                    {
                      label: 'Ratio étudiants / enseignants',
                      value: isLoading ? null : stats?.students && stats?.teachers ? `${Math.round(stats.students / Math.max(stats.teachers, 1))}:1` : '—',
                      color: 'bg-emerald-500',
                      icon: Users,
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-all group">
                      <div className={`${item.color} p-2.5 rounded-xl shrink-0`}>
                        <item.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black uppercase tracking-widest opacity-50">{item.label}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {isLoading
                          ? <div className="h-6 w-14 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                          : <p className="text-xl font-black">{item.value}</p>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Accès rapides */}
              <GlassCard title="Accès Rapides" description="Modules de pilotage." className="shadow-none border-none ring-1 ring-(--glass-border)">
                <div className="space-y-2 pt-4">
                  {[
                    { label: 'Analytics & IA', href: '/analytics', icon: BarChart3, color: 'text-violet-500', desc: 'Dashboards & alertes' },
                    { label: 'Finance', href: '/finance', icon: Wallet, color: 'text-emerald-500', desc: 'Factures & recouvrement' },
                    { label: 'Admissions', href: '/scolarity', icon: GraduationCap, color: 'text-indigo-500', desc: 'Dossiers & inscriptions' },
                    { label: 'Cours & LMS', href: '/courses', icon: BookOpen, color: 'text-amber-500', desc: 'Catalogue & progression' },
                    { label: 'Utilisateurs', href: '/users', icon: Users, color: 'text-rose-500', desc: 'Gestion des comptes' },
                  ].map((item, i) => (
                    <Link
                      key={i}
                      href={item.href}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold">{item.label}</p>
                        <p className="text-[10px] opacity-40 font-medium">{item.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Finance snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassCard className="border-none ring-1 ring-(--glass-border) shadow-none">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-50">Recettes encaissées</p>
                </div>
                {isLoading
                  ? <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  : <p className="text-3xl font-black">{fmt(stats?.totalRevenue ?? 0)} <span className="text-sm opacity-40">FCFA</span></p>
                }
              </GlassCard>
              <GlassCard className="border-none ring-1 ring-(--glass-border) shadow-none">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-rose-500/10 rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-50">Créances impayées</p>
                </div>
                {isLoading
                  ? <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  : <p className="text-3xl font-black text-rose-500">{fmt(stats?.totalUnpaid ?? 0)} <span className="text-sm opacity-40">FCFA</span></p>
                }
              </GlassCard>
              <GlassCard className="border-none ring-1 ring-(--glass-border) shadow-none">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-50">Candidatures en attente</p>
                </div>
                {isLoading
                  ? <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  : <p className="text-3xl font-black text-amber-500">{stats?.pendingAdm ?? '—'}</p>
                }
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* ── ALERTES ── */}
        {activeTab === 'alerts' && (
          <motion.div key="alerts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GlassCard
              className="border-none ring-1 ring-(--glass-border) shadow-none"
              title={`Alertes Actives (${alerts.length})`}
              description="Signalements système nécessitant une décision ou un suivi."
              actions={
                <Link href="/analytics" className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary hover:underline underline-offset-4">
                  Tout voir <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              }
            >
              <div className="pt-4 space-y-3">
                {alertsLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  ))
                ) : alerts.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto opacity-60" />
                    <p className="font-black text-sm opacity-40">Aucune alerte active. Tout est nominal.</p>
                  </div>
                ) : (
                  alerts.map((alert, i) => <AlertItem key={alert.id ?? i} alert={alert} i={i} />)
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ── ADMISSIONS ── */}
        {activeTab === 'admissions' && (
          <motion.div key="admissions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GlassCard
              className="border-none ring-1 ring-(--glass-border) shadow-none"
              title="Dernières Candidatures"
              description="Vue synthétique des dossiers récents."
              actions={
                <Link href="/scolarity" className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary hover:underline underline-offset-4">
                  Gérer <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              }
            >
              <div className="pt-4 space-y-2">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  ))
                ) : (stats?.recentAdmissions ?? []).length === 0 ? (
                  <p className="text-center py-12 text-sm opacity-40 italic font-bold">Aucune candidature trouvée.</p>
                ) : (
                  (stats?.recentAdmissions ?? []).map((adm, i) => (
                    <motion.div
                      key={adm.id ?? i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl premium-gradient flex items-center justify-center text-white font-black text-xs shrink-0">
                        {(adm.firstName || adm.applicantFirstName || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">
                          {adm.firstName || adm.applicantFirstName || '—'} {adm.lastName || adm.applicantLastName || ''}
                        </p>
                        <p className="text-[10px] opacity-40 font-medium">{adm.programName || adm.program || '—'} • {fmtDate(adm.createdAt)}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest shrink-0 ${statusColor[adm.status] ?? 'text-slate-400 bg-slate-400/10'}`}>
                        {statusLabel[adm.status] ?? adm.status ?? '—'}
                      </span>
                    </motion.div>
                  ))
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ── FINANCE ── */}
        {activeTab === 'finance' && (
          <motion.div key="finance" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard className="border-none ring-1 ring-(--glass-border) shadow-none">
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-widest opacity-50">Recettes encaissées</p>
                  {isLoading
                    ? <div className="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    : <p className="text-4xl font-black text-emerald-500">{fmt(stats?.totalRevenue ?? 0)}</p>
                  }
                  <p className="text-xs opacity-40 font-bold">FCFA</p>
                </div>
              </GlassCard>
              <GlassCard className="border-none ring-1 ring-(--glass-border) shadow-none">
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-widest opacity-50">Créances impayées</p>
                  {isLoading
                    ? <div className="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    : <p className="text-4xl font-black text-rose-500">{fmt(stats?.totalUnpaid ?? 0)}</p>
                  }
                  <p className="text-xs opacity-40 font-bold">FCFA • {stats?.unpaidCount ?? '…'} dossiers</p>
                </div>
              </GlassCard>
              <GlassCard className="border-none ring-1 ring-(--glass-border) shadow-none">
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-widest opacity-50">Taux de recouvrement</p>
                  {isLoading
                    ? <div className="h-10 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    : <p className={`text-4xl font-black ${(stats?.recoveryRate ?? 0) >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {stats?.recoveryRate ?? '—'}%
                      </p>
                  }
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats?.recoveryRate ?? 0}%` }}
                      transition={{ duration: 1.2 }}
                      className={`h-full rounded-full ${(stats?.recoveryRate ?? 0) >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    />
                  </div>
                </div>
              </GlassCard>
            </div>

            <GlassCard
              className="border-none ring-1 ring-(--glass-border) shadow-none"
              title="Actions Finance"
              actions={
                <Link href="/finance" className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary hover:underline underline-offset-4">
                  Module Finance <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                {[
                  { label: 'Exporter le rapport financier', icon: Download, href: '/finance' },
                  { label: 'Voir les impayés critiques', icon: AlertTriangle, href: '/finance' },
                  { label: 'Lancer les relances globales', icon: Zap, href: '/finance' },
                  { label: 'Grand livre comptable', icon: Eye, href: '/finance' },
                ].map((action, i) => (
                  <Link
                    key={i}
                    href={action.href}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-(--glass-border) hover:border-primary/40 hover:bg-primary/5 transition-all group"
                  >
                    <action.icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-bold">{action.label}</span>
                    <ChevronRight className="w-4 h-4 opacity-30 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
