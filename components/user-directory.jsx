'use client'

import { Search, UserPlus, FileText, LayoutGrid, MoreVertical, Filter, Download } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

import { Trash2, Edit2 } from 'lucide-react'

export function UserDirectory({ title, description, role, users = [], isLoading, onDelete, onEdit, onAdd, activeRole, onRoleChange }) {
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
       <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
       <p className="text-xs font-black uppercase tracking-widest italic text-primary">Synchronisation...</p>
    </div>
  )

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
           <button 
             onClick={onAdd}
             className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black shadow-lg hover:shadow-xl transition-all active:scale-95 group"
           >
             <UserPlus className="w-5 h-5" />
             <span>Ajouter</span>
           </button>
        </div>
      </header>

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 glass-card rounded-2xl border-(--glass-border) overflow-x-auto no-scrollbar max-w-full mx-2">
         {[
           {id: 'ALL', label: 'Tout le Personnel'},
           {id: 'ADMIN', label: 'Admins'},
           {id: 'SCHOOL_MANAGER', label: 'Direction'},
           {id: 'TEACHER', label: 'Enseignants'},
           {id: 'STUDENT', label: 'Étudiants'},
           {id: 'FINANCE_MANAGER', label: 'Finance'},
           {id: 'PEDAGOGICAL_MANAGER', label: 'Scolarité'},
           {id: 'MENTOR', label: 'Mentors'},
           {id: 'SUPPORT', label: 'Support'},
         ].map((r) => (
           <button
             key={r.id}
             onClick={() => onRoleChange?.(r.id)}
             className={cn(
               "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
               (activeRole === r.id) 
                 ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                 : "opacity-40 hover:opacity-100 hover:bg-primary/5"
             )}
           >
             {r.label}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {users.map((user, idx) => {
          const name = user.name || `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim() || 'Utilisateur';
          const code = user.code || user.userCode || user.user_code || `ID-${user.id}`;
          
          return (
            <motion.div
              key={user.id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <GlassCard className="relative group cursor-pointer hover:border-primary/30 transition-shadow">
                 <div className="flex items-start justify-between">
                    <div className="flex items-center gap-5">
                       <div className="w-16 h-16 rounded-2xl premium-gradient p-[2px] shadow-lg shadow-primary/10 transition-transform group-hover:scale-105">
                          <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center font-black text-xl">
                            {name.charAt(0)}
                          </div>
                       </div>
                       <div>
                          <h4 className="font-extrabold text-lg transition-colors group-hover:text-primary">{name}</h4>
                          <p className="text-[10px] font-black italic opacity-40 uppercase tracking-widest text-primary">{user.role}</p>
                          <p className="text-sm font-bold opacity-60 italic">{code}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(user.role !== 'SUPER_ADMIN' && name !== 'Super Admin') ? (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onEdit?.(user) }}
                            className="p-2 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                             onClick={(e) => { e.stopPropagation(); onDelete?.(user.id, name) }}
                             className="p-2 rounded-xl hover:bg-rose-500 hover:text-white transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="px-2 py-1 rounded-lg bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest ring-1 ring-primary/40">ROOT</span>
                      )}
                    </div>
                 </div>
                 
                 <div className="mt-8 grid grid-cols-2 gap-4 border-t border-(--glass-border) pt-6">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-transparent group-hover:border-primary/10 transition-colors">
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1 italic">Contact</p>
                      <p className="text-xs font-bold truncate opacity-80">{user.email}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-transparent group-hover:border-primary/10 transition-colors">
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1 italic">Statut</p>
                      <span className={cn("text-[10px] font-black uppercase tracking-[0.15em] italic", 
                        (user.status === 'ACTIVE' || user.active) ? "text-emerald-500" : "text-amber-500")}>
                        {user.status || 'DRAFT'}
                      </span>
                    </div>
                 </div>
                 
                 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/20 transition-all" />
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  )
}
