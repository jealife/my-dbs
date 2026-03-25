'use client'

import { Search, UserPlus, FileText, LayoutGrid, MoreVertical, Filter, Download } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function UserDirectory({ title, description, role, users }) {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-left duration-1000">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between px-2 gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-black uppercase tracking-widest ring-1 ring-primary/20">{role}</div>
           </div>
           <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">{title}</h1>
           <p className="text-muted-foreground mt-3 text-[0.95rem] font-medium font-serif italic max-w-xl opacity-80">{description}</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-3 px-6 py-4 rounded-2xl glass-card transition-all font-bold hover:scale-105 active:scale-95 group">
             <Download className="w-5 h-5 group-hover:text-primary transition-colors" />
             <span className="opacity-80 group-hover:opacity-100 transition-opacity">Exporter</span>
           </button>
           <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black shadow-lg hover:shadow-xl transition-all active:scale-95 group">
             <UserPlus className="w-5 h-5" />
             <span>Ajouter</span>
           </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 px-2">
        <div className="relative group md:w-[400px]">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
           <input 
             type="text" 
             placeholder="Filtrer par nom, email ou code..." 
             className="w-full pl-12 pr-4 py-4 rounded-2xl bg-(--glass-border)/20 border border-(--glass-border) focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-base font-bold placeholder:italic placeholder:opacity-40"
           />
        </div>
        <button className="p-4 rounded-2xl glass-card hover:border-primary transition-colors">
          <Filter className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {users.map((user, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <GlassCard className="relative group cursor-pointer hover:border-primary/30 transition-shadow">
               <div className="flex items-start justify-between">
                  <div className="flex items-center gap-5">
                     <div className="w-16 h-16 rounded-2xl premium-gradient p-[2px] shadow-lg shadow-primary/10 transition-transform group-hover:scale-105">
                        <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center font-black text-xl">
                          {user.name.charAt(0)}
                        </div>
                     </div>
                     <div>
                        <h4 className="font-extrabold text-lg transition-colors group-hover:text-primary">{user.name}</h4>
                        <p className="text-sm font-bold opacity-60 italic">{user.code}</p>
                     </div>
                  </div>
                  <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100"><MoreVertical className="w-5 h-5" /></button>
               </div>
               
               <div className="mt-8 grid grid-cols-2 gap-4 border-t border-(--glass-border) pt-6">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-transparent group-hover:border-primary/10 transition-colors">
                    <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1 italic">Contact</p>
                    <p className="text-xs font-bold truncate opacity-80">{user.email}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-transparent group-hover:border-primary/10 transition-colors">
                    <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1 italic">Statut</p>
                    <span className={cn("text-xs font-black uppercase tracking-tight", user.active ? "text-emerald-500" : "text-amber-500")}>
                      {user.active ? 'ACTIF' : 'PENDANT'}
                    </span>
                  </div>
               </div>
               
               <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/20 transition-all" />
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
