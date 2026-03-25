'use client'

import { 
  Users, 
  UserPlus, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  ArrowUpRight, 
  Calendar,
  Layers,
  Search,
  Activity
} from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { useState } from 'react'
import { AddUserModal } from '@/modules/users/components/add-user-modal'

const stats = [
  { label: 'Total Étudiants', val: '2,485', delta: '+8%', trend: 'up', icon: GraduationCap, color: 'bg-indigo-500' },
  { label: 'Nouveaux Inscrits', val: '142', delta: '+15%', trend: 'up', icon: UserPlus, color: 'bg-emerald-500' },
  { label: 'Salles Occupées', val: '42', delta: '-3%', trend: 'down', icon: Layers, color: 'bg-amber-500' },
  { label: 'Taux Réussite', val: '89%', delta: '+2%', trend: 'up', icon: Activity, color: 'bg-blue-500' },
]

export function AdminDashboard({ user }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="space-y-12 py-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">
            Console <span className="text-primary italic">ADMIN</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">
            Bienvenue, {user?.first_name}. Vue d'ensemble de l'écosystème My DBS.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <button className="px-6 py-3 rounded-2xl glass-card font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all border-(--glass-border)">
            Extraire Rapport
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all"
          >
            <UserPlus className="w-5 h-5" />
            Nouvelle Inscription
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
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
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-colors" />
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <GlassCard 
          className="xl:col-span-2 shadow-none border-none ring-1 ring-(--glass-border)" 
          title="Alertes & Activités Système" 
          description="Monitoring en temps réel des flux académiques."
        >
          <div className="space-y-6 pt-4">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all border border-transparent hover:border-(--glass-border) group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-xl shadow-slate-900/5 flex items-center justify-center font-black group-hover:bg-primary group-hover:text-white transition-all">
                    A{i}
                  </div>
                  <div>
                    <h4 className="font-bold text-[0.95rem]">Modification de cours : Architecture Java v2</h4>
                    <p className="text-xs font-semibold opacity-40 italic mt-0.5">Par Dr. Jean Baptiste • Il y a 14 min</p>
                  </div>
                </div>
                <button className="p-2.5 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all">
                  <ArrowUpRight className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard 
          title="Flux Trésorerie" 
          description="Aperçu des paiements scolarité." 
          className="shadow-none border-none ring-1 ring-(--glass-border)"
        >
          <div className="space-y-8 pt-6">
             <div className="p-6 rounded-3xl premium-gradient text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
                <p className="text-xs font-black uppercase tracking-widest opacity-60">Total Collecté ce mois</p>
                <p className="text-4xl font-black mt-2 tracking-tighter italic">45.2M CFA</p>
                <TrendingUp className="absolute right-4 bottom-4 w-12 h-12 opacity-20" />
             </div>

             <div className="space-y-4 px-2">
                {[
                  { label: 'Scolarités Payées', pct: 82, color: 'bg-emerald-500' },
                  { label: 'Reliquats En Attente', pct: 18, color: 'bg-amber-500' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest opacity-60 italic">
                      <span>{item.label}</span>
                      <span>{item.pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.pct}%` }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className={`h-full ${item.color} shadow-lg`}
                      />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </GlassCard>
      </div>
      <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
