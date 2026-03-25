'use client'

import { 
  GraduationCap, 
  BookOpen, 
  ClipboardList, 
  Calendar, 
  ArrowUpRight, 
  TrendingUp, 
  Clock, 
  Award, 
  Star 
} from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'

export function StudentDashboard({ user }) {
  const academicProgress = 74 // Logic: Average of all courses

  return (
    <div className="space-y-12 py-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl premium-gradient p-px shadow-2xl shadow-primary/20">
             <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center font-black text-2xl uppercase italic">
                {user?.first_name?.[0] || 'S'}
             </div>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter italic">
              Hello, <span className="text-primary italic">{user?.first_name}</span>
            </h1>
            <p className="text-muted-foreground mt-1 font-medium italic opacity-60">
              Prêt pour vos cours d'aujourd'hui ? Réussite académique : <span className="text-primary font-black uppercase tracking-widest">{academicProgress}%</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <button className="px-6 py-3 rounded-2xl glass-card font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all border-(--glass-border)">
            Mon Bulletin
          </button>
          <button className="px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all">
            Inscriptions
          </button>
        </div>
      </header>

      {/* Student Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="glass-card border-none ring-1 ring-(--glass-border) shadow-none p-6 relative group overflow-hidden">
           <div className="flex gap-4 items-center mb-6">
             <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                <BookOpen className="w-6 h-6" />
             </div>
             <div>
                <p className="text-2xl font-black">8</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Cours Actifs</p>
             </div>
           </div>
           <div className="space-y-4">
              <div className="flex justify-between items-center text-[11px] font-black uppercase italic tracking-widest opacity-60">
                 <span>Progression Semestre</span>
                 <span>72%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                 <motion.div initial={{ width: 0 }} animate={{ width: '72%' }} className="h-full bg-indigo-500 rounded-full shadow-lg" />
              </div>
           </div>
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
        </GlassCard>

        <GlassCard className="glass-card border-none ring-1 ring-(--glass-border) shadow-none p-6 relative group overflow-hidden">
           <div className="flex gap-4 items-center mb-6">
             <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                <Star className="w-6 h-6" />
             </div>
             <div>
                <p className="text-2xl font-black">15.8</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Moyenne Générale</p>
             </div>
           </div>
           <div className="flex gap-2">
              {[1, 1, 1, 1, 0.5].map((s, i) => (
                <Star key={i} className={`w-4 h-4 ${s === 1 ? 'fill-amber-500 text-amber-500' : 'text-amber-500'}`} />
              ))}
           </div>
           <p className="text-xs font-bold italic mt-4 opacity-70">Top 5% de la promotion</p>
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-amber-500/10 transition-colors" />
        </GlassCard>

        <GlassCard className="glass-card border-none ring-1 ring-(--glass-border) shadow-none p-6 relative group overflow-hidden">
           <div className="flex gap-4 items-center mb-6">
             <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                <ClipboardList className="w-6 h-6" />
             </div>
             <div>
                <p className="text-2xl font-black">3</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Examens à venir</p>
             </div>
           </div>
           <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <Clock className="w-4 h-4 text-emerald-500" />
              <p className="text-[10px] font-black uppercase tracking-tight text-emerald-600">Prochain : Intro to AI (Demain 09:00)</p>
           </div>
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <GlassCard title="Cours du jour" description="Votre emploi du temps personnalisé pour aujourd'hui." className="shadow-none border-none ring-1 ring-(--glass-border)">
           <div className="space-y-6 pt-6">
              {[
                { time: '08:30', name: 'Algorithmique Avancée', room: 'Salle 402', prof: 'Dr. Mofid' },
                { time: '10:45', name: 'Base de données SQL', room: 'Lab CC2', prof: 'Prof. Sarah' },
                { time: '14:00', name: 'Réseaux & Sécurité', room: 'Amphi B', prof: 'M. Koffi' },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-(--glass-border) group">
                   <div className="flex flex-col items-center justify-center p-3 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-(--glass-border) shadow-xl shadow-slate-900/5 group-hover:bg-primary group-hover:text-white transition-all">
                      <p className="text-sm font-black italic">{c.time}</p>
                   </div>
                   <div className="flex-1">
                      <h4 className="font-bold text-[0.95rem]">{c.name}</h4>
                      <p className="text-xs font-semibold opacity-40 italic mt-0.5">{c.room} • {c.prof}</p>
                   </div>
                   <button className="p-2.5 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all">
                      <ArrowUpRight className="w-5 h-5 transition-transform group-hover:scale-110" />
                   </button>
                </div>
              ))}
           </div>
        </GlassCard>

        <div className="space-y-8">
           <GlassCard title="Ressources Récentes" className="shadow-none border-none ring-1 ring-(--glass-border)">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                 {[
                   { name: 'Chapitre 4 - PDF', size: '2.4 MB', type: 'PDF' },
                   { name: 'Travaux Pratiques #2', size: '1.1 MB', type: 'ZIP' },
                 ].map((d, i) => (
                    <div key={i} className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-(--glass-border) flex items-center gap-4 hover:border-primary/50 transition-all cursor-pointer group">
                       <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center text-white font-black text-[10px]">{d.type}</div>
                       <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{d.name}</p>
                          <p className="text-[10px] opacity-40">{d.size}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </GlassCard>

           <div className="p-8 rounded-3xl bg-primary text-white shadow-2xl shadow-primary/30 relative overflow-hidden group cursor-pointer">
              <h3 className="text-xl font-black italic">Besoin d'aide ?</h3>
              <p className="text-sm font-medium mt-2 opacity-80 max-w-xs">Contactez un mentor ou posez votre question à l'assistance académique.</p>
              <button className="mt-6 px-6 py-3 bg-white text-primary rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl group-hover:scale-105 transition-transform active:scale-95">
                 Ouvrir un ticket
              </button>
              <Calendar className="absolute right-[-20px] bottom-[-20px] w-40 h-40 opacity-10 rotate-12" />
           </div>
        </div>
      </div>
    </div>
  )
}
