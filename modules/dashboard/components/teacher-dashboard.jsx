'use client'

import { 
  Users, 
  UserCheck, 
  Calendar, 
  ClipboardList, 
  MessageSquare, 
  ArrowUpRight, 
  Plus, 
  Settings, 
  Activity, 
  Target,
  GraduationCap
} from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'

export function TeacherDashboard({ user }) {
  return (
    <div className="space-y-12 py-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">
            Portail <span className="text-primary italic">ENSEIGNANT</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">
            Bonne session de cours, Prof. {user?.last_name}. Vous avez <span className="text-primary font-black uppercase">3 sessions</span> aujourd'hui.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <button className="px-6 py-4 rounded-2xl glass-card border-(--glass-border) flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all active:scale-95">
             <Plus className="w-5 h-5 text-primary" />
             Créer Évaluation
          </button>
          <button className="px-6 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all">
             Appel / Présence
          </button>
        </div>
      </header>

      {/* Teacher Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Classes Attribuées', val: '4', icon: Users, color: 'bg-indigo-500' },
          { label: 'Étudiants Totaux', val: '286', icon: GraduationCap, color: 'bg-emerald-500' },
          { label: 'Évaluations Actives', val: '12', icon: ClipboardList, color: 'bg-amber-500' },
          { label: 'Heures / Mois', val: '64h', icon: Calendar, color: 'bg-blue-500' },
        ].map((item, i) => (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i}>
            <GlassCard className="border-none ring-1 ring-(--glass-border) shadow-none p-6 group">
               <div className="flex justify-between items-start mb-4">
                  <div className={`${item.color} p-3 rounded-2xl shadow-xl shadow-slate-900/5 group-hover:scale-110 transition-transform duration-500`}>
                     <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <Target className="w-4 h-4 text-muted-foreground opacity-20" />
               </div>
               <p className="text-2xl font-black tracking-tight">{item.val}</p>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">{item.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <GlassCard title="Sessions du jour" description="Votre emploi du temps de la journée." className="xl:col-span-2 shadow-none border-none ring-1 ring-(--glass-border)">
           <div className="space-y-4 pt-4">
              {[
                { time: '08:30 - 10:30', class: '3éme Année - INFO', name: 'Algorithmique Avancée', status: 'En cours', color: 'text-emerald-500 bg-emerald-500/10' },
                { time: '10:45 - 12:45', class: 'Master 1 - DATA', name: 'Intro to Python', status: 'À venir', color: 'text-amber-500 bg-amber-500/10' },
                { time: '14:00 - 16:00', class: '3éme Année - INFO', name: 'Algorithmique Avancée', status: 'À venir', color: 'text-slate-400 bg-slate-400/10' },
              ].map((s, idx) => (
                 <div key={idx} className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-(--glass-border) group">
                    <div className="w-16 flex flex-col items-center justify-center p-2 rounded-2xl bg-white dark:bg-slate-900 border border-(--glass-border) shadow-xl shadow-slate-900/5 group-hover:bg-primary group-hover:text-white transition-all">
                       <p className="text-[10px] font-black italic">{s.time.split(' - ')[0]}</p>
                    </div>
                    <div className="flex-1">
                       <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[0.95rem]">{s.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${s.color}`}>{s.status}</span>
                       </div>
                       <p className="text-xs font-semibold opacity-40 italic mt-0.5 uppercase tracking-tight">{s.class}</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-primary hover:text-white transition-all text-[0.92rem] font-bold">
                       <UserCheck className="w-4 h-4" />
                       <span className="hidden sm:inline">Appel</span>
                    </button>
                 </div>
              ))}
           </div>
        </GlassCard>

        <div className="space-y-8">
           <GlassCard title="Rappels / To-Do" className="shadow-none border-none ring-1 ring-(--glass-border)">
              <div className="space-y-4 pt-4">
                  {[
                    { task: 'Corriger Exam - Intro Java', deadline: 'Demain', urgent: true },
                    { task: 'Préparer TD - Architecture', deadline: 'Dans 3 jours', urgent: false },
                    { task: 'Réunion Pédagogique', deadline: '24 Mars', urgent: false },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-transparent hover:border-(--glass-border) transition-all cursor-pointer group">
                       <div className={`w-2 h-2 rounded-full ${t.urgent ? 'bg-rose-500 animate-pulse' : 'bg-primary'}`} />
                       <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate tracking-tight">{t.task}</p>
                          <p className="text-[10px] opacity-40 font-semibold italic">{t.deadline}</p>
                       </div>
                       <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all shadow-md active:scale-90">
                          <Plus className="w-4 h-4" />
                       </div>
                    </div>
                  ))}
              </div>
           </GlassCard>

           <GlassCard title="Feedback Étudiants" className="shadow-none border-none ring-1 ring-(--glass-border)">
              <div className="flex items-center gap-6 pt-2">
                 <div className="text-center">
                    <p className="text-3xl font-black text-emerald-500">4.8</p>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Satisf. / 5</p>
                 </div>
                 <div className="h-10 w-px bg-(--glass-border) opacity-50" />
                 <div className="flex-1">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-black">AI</div>
                       <p className="text-xs italic font-medium opacity-70 truncate line-clamp-1">"Excellent support de cours..."</p>
                    </div>
                 </div>
              </div>
           </GlassCard>
        </div>
      </div>
    </div>
  )
}
