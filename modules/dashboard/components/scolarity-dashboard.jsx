'use client'

import { 
  Building2, 
  UserPlus, 
  GraduationCap, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowUpRight,
  ClipboardList,
  Plus
} from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'

export function ScolarityDashboard({ user }) {
  const scolarityStats = [
    { label: 'Admissions / Mois', val: '42', delta: '+12%', trend: 'up', icon: UserPlus, color: 'bg-emerald-500' },
    { label: 'Dossiers Incomplets', val: '18', delta: '+4%', trend: 'up', icon: AlertCircle, color: 'bg-rose-500' },
    { label: 'Certificats Emis', val: '156', delta: '+25%', trend: 'up', icon: FileText, color: 'bg-indigo-500' },
    { label: 'Cours Actifs', val: '86', delta: '+2%', trend: 'up', icon: GraduationCap, color: 'bg-amber-500' },
  ]

  return (
    <div className="space-y-12 py-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">
            Portail <span className="text-primary italic">SCOLARITÉ</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">
            Gestion académique, admissions et administration des parcours.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <button className="px-6 py-3 rounded-2xl glass-card font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all border-(--glass-border) flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            Nouvelle Admission
          </button>
          <button className="px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all">
            Imprimer Certificats
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {scolarityStats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }} 
            key={i}
          >
            <GlassCard className="relative overflow-hidden group border-none ring-1 ring-(--glass-border) hover:ring-primary/40 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.color} p-3 rounded-2xl shadow-xl shadow-slate-900/5 group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${stat.trend === 'up' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                  {stat.delta}
                </div>
              </div>
              <div>
                <p className="text-3xl font-black tracking-tight">{stat.val}</p>
                <p className="text-sm font-bold opacity-40 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <GlassCard 
          className="xl:col-span-2 shadow-none border-none ring-1 ring-(--glass-border)" 
          title="Admissions en Attente" 
          description="Validation des dossiers d'inscription des nouveaux étudiants."
        >
          <div className="space-y-4 pt-4">
            {[
              { name: 'Koffi Marie-Ange', level: 'Master 1 DATA', date: 'Il y a 12 min', status: 'PENDING' },
              { name: 'Diarrassouba Moussa', level: 'Licence 2 INFO', date: 'Il y a 45 min', status: 'IN_REVIEW' },
              { name: 'Yao Emmanuelle', level: 'Bachelor AI', date: 'Il y a 1h', status: 'IN_REVIEW' },
              { name: 'Coulibaly Brahima', level: 'Master 2 CYBER', date: 'Il y a 3h', status: 'DOCUMENT_MISSING' },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all border border-transparent hover:border-(--glass-border) group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg text-white font-black",
                    a.status === 'PENDING' ? 'bg-indigo-500' : a.status === 'IN_REVIEW' ? 'bg-amber-500' : 'bg-rose-500'
                  )}>
                    {a.name[0]} {a.name.split(' ')[1]?.[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-[0.95rem]">{a.name}</h4>
                    <p className="text-xs font-semibold opacity-40 italic mt-0.5">{a.level} • {a.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <span className={cn(
                     "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                     a.status === 'PENDING' ? 'bg-indigo-500/10 text-indigo-500' : a.status === 'IN_REVIEW' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                   )}>
                     {a.status}
                   </span>
                   <button className="p-2.5 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all">
                    <ArrowUpRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard 
          title="Tâches Académiques" 
          description="Urgences et rappels administratifs." 
          className="shadow-none border-none ring-1 ring-(--glass-border)"
        >
          <div className="space-y-6 pt-4">
            {[
              { task: 'Clôture Inscription S2', deadline: '25 Mars', urgent: true },
              { task: 'Génération ID Étudiants', deadline: '28 Mars', urgent: false },
              { task: 'Audit dossiers boursiers', deadline: '02 Avril', urgent: false },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-transparent hover:border-(--glass-border) cursor-pointer group transition-all">
                <div className={cn(
                  "w-2 h-12 rounded-full",
                  t.urgent ? 'bg-rose-500 animate-pulse' : 'bg-indigo-500'
                )} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{t.task}</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Deadline: {t.deadline}</p>
                </div>
              </div>
            ))}
            <button className="w-full py-4 rounded-2xl bg-indigo-500/10 text-indigo-500 font-black text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all mt-4">
              Consulter tout le registre
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
