'use client'

import { 
  Users, 
  UserCheck, 
  MessageSquare, 
  Calendar, 
  AlertCircle,
  TrendingUp,
  User,
  MoreVertical,
  Clock
} from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'

export function MentorDashboard({ user }) {
  const mentoringStats = [
    { label: 'Étudiants Assignés', val: '24', delta: '+2', trend: 'up', icon: Users, color: 'bg-indigo-500' },
    { label: 'Rendez-vous / Sem', val: '12', delta: '+4', trend: 'up', icon: Calendar, color: 'bg-emerald-500' },
    { label: 'Alertes Blocage', val: '3', delta: '-1', trend: 'down', icon: AlertCircle, color: 'bg-rose-500' },
    { label: 'Validation Stage', val: '86%', delta: '+5%', trend: 'up', icon: UserCheck, color: 'bg-amber-500' },
  ]

  return (
    <div className="space-y-12 py-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">
            Portail <span className="text-primary italic">MENTOR</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">
            Suivi personnalisé et accompagnement des étudiants.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <button className="px-6 py-3 rounded-2xl glass-card font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all border-(--glass-border)">
            Planning Mensuel
          </button>
          <button className="px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all">
            Nouveau Rapport
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mentoringStats.map((stat, i) => (
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
          title="Alertes de Suivi" 
          description="Étudiants nécessitant une attention immédiate (absences, notes en baisse)."
        >
          <div className="space-y-4 pt-4">
            {[
              { name: 'Soro Gninlnan', reason: 'Absences répétées (3 sessions)', critical: true, icon: 'SG' },
              { name: 'Koffi Amenan', reason: 'Baisse de moyenne significative', critical: true, icon: 'KA' },
              { name: 'Diallo Ousmane', reason: 'Dossier de stage non déposé', critical: false, icon: 'DO' },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all border border-transparent hover:border-(--glass-border) group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg text-white font-black",
                    a.critical ? 'bg-rose-500' : 'bg-amber-500'
                  )}>
                    {a.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-[0.95rem]">{a.name}</h4>
                    <p className="text-xs font-semibold opacity-40 italic mt-0.5">{a.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button className="px-4 py-2 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                    Contacter
                  </button>
                  <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                    <MoreVertical className="w-4 h-4 opacity-40" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard 
          title="Sessions à venir" 
          description="Vos entretiens de mentorat prévus." 
          className="shadow-none border-none ring-1 ring-(--glass-border)"
        >
          <div className="space-y-6 pt-4">
            {[
              { student: 'Traoré Bakary', time: '14:30', room: 'Salle Conseil', date: 'Aujourd\'hui' },
              { student: 'Koné Fatoumata', time: '16:00', room: 'Zoom', date: 'Aujourd\'hui' },
              { student: 'N\'guessan Paul', time: '09:00', room: 'Bureau 102', date: 'Demain' },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-(--glass-border) group hover:border-primary/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex flex-col items-center justify-center border border-(--glass-border) group-hover:bg-primary group-hover:text-white transition-all">
                   <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{s.student}</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">{s.time} • {s.room}</p>
                  <p className="text-[9px] italic font-semibold text-primary mt-1">{s.date}</p>
                </div>
              </div>
            ))}
            <button className="w-full py-4 rounded-2xl bg-primary/5 text-primary font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all mt-4 border border-primary/20">
              Voir tout l'agenda
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
