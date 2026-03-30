'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, Clock, Users, PlayCircle, Star, 
  ArrowLeft, FileText, CheckCircle, Lock, 
  ChevronRight, Download, BarChart2, MessageSquare,
  Play, Pause, Award
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseService } from '@/lib/course-service'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export function CourseDetailsView({ courseId }) {
  const [activeTab, setActiveTab] = useState('content')

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseService.getCourseById(courseId),
    enabled: !!courseId,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-40">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest italic">Chargement du module...</p>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-black italic">Module Introuvable</h2>
        <p className="text-muted-foreground italic">Le cours demandé n&apos;est pas disponible ou a été archivé.</p>
        <Link href="/courses" className="inline-flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest mt-4">
          <ArrowLeft className="w-4 h-4" /> Retour au catalogue
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Top Nav */}
      <div className="flex items-center justify-between px-2">
        <Link href="/courses" className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 group-hover:bg-primary/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Retour Catalogue</span>
        </Link>
        <div className="flex gap-2">
          <button className="px-6 py-2.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all">
            Reprendre le cours
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative h-64 md:h-80 rounded-4xl overflow-hidden shadow-2xl group">
        <div className="absolute inset-0 premium-gradient opacity-90 z-10" />
        <div className="absolute inset-0 flex items-center justify-center z-20 text-white font-black text-6xl italic opacity-10 uppercase tracking-tighter transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700">
           {course.code || course.id}
        </div>
        <div className="absolute bottom-10 left-10 right-10 z-30 text-white space-y-4">
          <div className="flex items-center gap-3">
             <span className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest border border-white/20">
                {course.level || 'Intermédiaire'}
             </span>
             <span className="flex items-center gap-2 text-xs font-bold italic opacity-80 border-l border-white/20 pl-4 ml-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> 4.9/5 (128 avis)
             </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic">{course.name || course.title}</h1>
          <p className="max-w-2xl text-sm md:text-base font-medium opacity-80 leading-relaxed line-clamp-2 md:line-clamp-none">
            {course.description || "Maîtrisez les concepts fondamentaux et avancés de ce module pour booster vos compétences académiques."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        <div className="xl:col-span-1 space-y-4">
           {[
             { id: 'content', label: 'Plan du cours', icon: BookOpen },
             { id: 'docs', label: 'Ressources GED', icon: FileText },
             { id: 'stats', label: 'Statistiques', icon: BarChart2 },
             { id: 'qa', label: 'Q&A Communauté', icon: MessageSquare },
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={cn(
                 "w-full flex items-center gap-4 px-6 py-4 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all text-left",
                 activeTab === tab.id 
                   ? "bg-primary text-white shadow-xl shadow-primary/30 translate-x-2" 
                   : "glass-card border-(--glass-border) opacity-60 hover:opacity-100 hover:bg-primary/5"
               )}
             >
               <tab.icon className="w-4 h-4" />
               {tab.label}
             </button>
           ))}

           <GlassCard className="mt-8 p-6 border-none ring-1 ring-(--glass-border) space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest italic opacity-60">Instructeur</h4>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl premium-gradient flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">
                    {(course.teacherName || 'T')[0]}
                 </div>
                 <div>
                    <p className="font-bold text-[0.9rem]">{course.teacherName || 'Enseignant DBS'}</p>
                    <p className="text-[10px] font-black uppercase opacity-40">Spécialiste Senior</p>
                 </div>
              </div>
              <button className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-primary/10 hover:text-primary transition-all text-[10px] font-black uppercase tracking-widest">Voir profil complet</button>
           </GlassCard>
        </div>

        <div className="xl:col-span-3">
            <AnimatePresence mode="wait">
               {activeTab === 'content' && (
                 <motion.div key="content" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <h2 className="text-xl font-black italic tracking-tight mb-4 px-2">Chapitres & Sessions</h2>
                    {[
                      { title: 'Introduction aux fondamentaux', sessions: 4, duration: '2h 30m', lock: false },
                      { title: 'Analyse et Modélisation', sessions: 6, duration: '4h 15m', lock: false },
                      { title: 'Mise en œuvre pratique', sessions: 8, duration: '6h 00m', lock: true },
                      { title: 'Examen final & Certification', sessions: 1, duration: '3h 00m', lock: true },
                    ].map((section, idx) => (
                      <GlassCard key={idx} className={cn("p-6 border-none ring-1 ring-(--glass-border) group hover:shadow-2xl transition-all cursor-pointer", section.lock && "opacity-60")}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-5">
                             <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                {section.lock ? <Lock className="w-5 h-5" /> : (idx === 0 ? <Play className="w-4 h-4 fill-primary" /> : <CheckCircle className="w-5 h-5" />)}
                             </div>
                             <div>
                                <h4 className="font-black text-[1rem] tracking-tight">{section.title}</h4>
                                <div className="flex items-center gap-3 mt-1 opacity-40 text-[10px] font-black uppercase tracking-widest">
                                   <span>{section.sessions} SESSIONS</span>
                                   <span>•</span>
                                   <span>{section.duration}</span>
                                </div>
                             </div>
                          </div>
                          <ChevronRight className="w-5 h-5 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                      </GlassCard>
                    ))}
                 </motion.div>
               )}

               {activeTab === 'docs' && (
                 <motion.div key="docs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { title: 'Syllabus complet', type: 'PDF', size: '2.4 MB' },
                      { title: 'Support de cours - Session 1', type: 'PPTX', size: '12.8 MB' },
                      { title: 'Projet de fin de semestre', type: 'DOCX', size: '1.2 MB' },
                      { title: 'Ressources biblio', type: 'ZIP', size: '45.0 MB' },
                    ].map((doc, idx) => (
                      <GlassCard key={idx} className="p-6 border-none ring-1 ring-(--glass-border) hover:shadow-2xl transition-all cursor-pointer group flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                              <FileText className="w-6 h-6" />
                           </div>
                           <div className="min-w-0">
                              <h4 className="font-bold text-sm truncate">{doc.title}</h4>
                              <p className="text-[10px] font-black uppercase mt-1 opacity-40">{doc.type} • {doc.size}</p>
                           </div>
                        </div>
                        <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:text-primary transition-all shadow-md group-hover:scale-110">
                           <Download className="w-4 h-4" />
                        </button>
                      </GlassCard>
                    ))}
                 </motion.div>
               )}

               {activeTab === 'stats' && (
                 <motion.div key="stats" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <GlassCard className="p-6 bg-primary/5 text-primary ring-primary/20">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Taux Réussite</p>
                          <h3 className="text-4xl font-black italic">84%</h3>
                       </GlassCard>
                       <GlassCard className="p-6 bg-emerald-500/5 text-emerald-500 ring-emerald-500/20">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Completion</p>
                          <h3 className="text-4xl font-black italic">62%</h3>
                       </GlassCard>
                       <GlassCard className="p-6 bg-amber-500/5 text-amber-500 ring-amber-500/20">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Certification</p>
                          <Award className="w-10 h-10 mt-2" />
                       </GlassCard>
                    </div>

                    <GlassCard title="Progression Moyenne Étudiants" className="h-64 flex items-center justify-center italic opacity-30 font-black text-xs uppercase tracking-widest">
                       Graphique analytique en cours de génération...
                    </GlassCard>
                 </motion.div>
               )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
