'use client'

import { BookOpen, GraduationCap, LayoutGrid, List, Filter, Search, Plus, Clock, FileText } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { motion } from 'framer-motion'

const courses = [
  { 
    title: 'Développement Web Moderne', 
    code: 'CS-101', 
    credits: 5, 
    coeff: 2.0, 
    teacher: 'Dr. Alan Turing',
    status: 'ACTIVE',
    color: 'border-blue-500' 
  },
  { 
    title: 'Management de Projet', 
    code: 'MG-200', 
    credits: 3, 
    coeff: 1.5, 
    teacher: 'Pr. Ada Lovelace',
    status: 'ACTIVE',
    color: 'border-purple-500' 
  },
  { 
    title: 'Systèmes de Base de Données', 
    code: 'DB-305', 
    credits: 6, 
    coeff: 2.5, 
    teacher: 'Dr. Nikola Tesla',
    status: 'DRAFT',
    color: 'border-amber-500' 
  },
]

export default function LMSPage() {
  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between px-2 gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-black uppercase tracking-widest ring-1 ring-primary/20 italic">LMS - Système</div>
           </div>
           <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">Catalogue des Cours</h1>
           <p className="text-muted-foreground mt-3 text-[0.95rem] font-medium font-serif italic max-w-xl">
             Explorez les programmes de formation, assignez les professeurs et suivez les crédits ECTS par académie.
           </p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-white font-black shadow-lg hover:shadow-primary/40 transition-all active:scale-95 group">
             <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
             <span>Nouveau Cours</span>
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <GlassCard 
              className={`border-l-4 ${course.color} group hover:shadow-2xl transition-all h-full flex flex-col`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                   <BookOpen className="w-6 h-6" />
                </div>
                <div className={`text-[10px] font-black uppercase tracking-tighter px-2.5 py-1 rounded-full ${course.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                  {course.status}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="font-extrabold text-xl tracking-tight mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                <p className="text-sm font-bold opacity-60 italic mb-6">ID: {course.code}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold tracking-tight py-2 border-b border-(--glass-border)">
                    <span className="opacity-70 italics uppercase">Professeur</span>
                    <span>{course.teacher}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold tracking-tight py-2 border-b border-(--glass-border)">
                    <span className="opacity-70 italics uppercase">Crédits ECTS</span>
                    <span className="text-primary font-black">{course.credits}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                 <button className="flex-1 py-3 text-xs font-black uppercase tracking-widest bg-(--glass-border)/20 hover:bg-primary hover:text-white rounded-xl transition-all active:scale-95">Éditer</button>
                 <button className="px-4 py-3 bg-(--glass-border)/20 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"><FileText className="w-4 h-4 opacity-70" /></button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
