'use client'

import { 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  Wallet, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowDownRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'

export function FinanceDashboard({ user }) {
  const stats = [
    { label: 'Recettes Totales', val: '124.5M', delta: '+12%', trend: 'up', icon: Wallet, color: 'bg-emerald-500' },
    { label: 'Impayés', val: '18.2M', delta: '+4%', trend: 'up', icon: AlertTriangle, color: 'bg-rose-500' },
    { label: 'Paiements du Jour', val: '4.8M', delta: '+25%', trend: 'up', icon: CreditCard, color: 'bg-indigo-500' },
    { label: 'Taux Recouvrement', val: '86%', delta: '+2%', trend: 'up', icon: TrendingUp, color: 'bg-amber-500' },
  ]

  return (
    <div className="space-y-12 py-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">
            Portail <span className="text-primary italic">FINANCE</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">
            Gestion des flux financiers et recouvrement scolarité.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <button className="px-6 py-3 rounded-2xl glass-card font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all border-(--glass-border)">
            Grand Livre
          </button>
          <button className="px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all">
            Relances Globales
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
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <GlassCard 
          className="xl:col-span-2 shadow-none border-none ring-1 ring-(--glass-border)" 
          title="Transactions Récentes" 
          description="Derniers encaissements validés par le système."
        >
          <div className="space-y-4 pt-4">
            {[
              { student: 'Diallo Ousmane', amount: '450,000 CFA', date: 'Il y a 12 min', status: 'VALIDATED' },
              { student: 'Koffi Amenan', amount: '120,000 CFA', date: 'Il y a 45 min', status: 'PENDING' },
              { student: 'Traoré Bakary', amount: '750,000 CFA', date: 'Il y a 1h', status: 'VALIDATED' },
              { student: 'Soro Gninlnan', amount: '200,000 CFA', date: 'Il y a 3h', status: 'FAILED' },
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all border border-transparent hover:border-(--glass-border) group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-black group-hover:scale-105 transition-all text-white shadow-lg",
                    t.status === 'VALIDATED' ? 'bg-emerald-500' : t.status === 'PENDING' ? 'bg-amber-500' : 'bg-rose-500'
                  )}>
                    {t.status === 'VALIDATED' ? <CheckCircle2 className="w-6 h-6" /> : t.status === 'PENDING' ? <Clock className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-[0.95rem]">{t.student}</h4>
                    <p className="text-xs font-semibold opacity-40 italic mt-0.5">{t.date} • {t.amount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <span className={cn(
                     "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                     t.status === 'VALIDATED' ? 'bg-emerald-500/10 text-emerald-500' : t.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                   )}>
                     {t.status}
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
          title="Relances à Effectuer" 
          description="Étudiants avec solde débiteur critique." 
          className="shadow-none border-none ring-1 ring-(--glass-border)"
        >
          <div className="space-y-6 pt-4">
            {[
              { name: 'Koné Fatoumata', debt: '850,000 CFA', level: 'Master 2' },
              { name: 'N\'guessan Paul', debt: '420,000 CFA', level: 'Licence 3' },
              { name: 'Sylla Ibrahim', debt: '1,200,000 CFA', level: 'Bachelor' },
            ].map((s, i) => (
              <div key={i} className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-(--glass-border) space-y-3 group hover:border-rose-500/50 transition-all">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm">{s.name}</h4>
                  <span className="text-rose-500 font-black text-xs">{s.debt}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{s.level}</p>
                  <button className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                    Relancer
                  </button>
                </div>
              </div>
            ))}
            <button className="w-full py-4 rounded-2xl bg-rose-500/10 text-rose-500 font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all mt-4">
              Voir tous les impayés
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
