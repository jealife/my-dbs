'use client'

import { motion } from 'framer-motion'
import { Plus, Search, Layers, GraduationCap, ArrowRight, Award, Trash2, Edit } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useAcademic } from '../hooks/use-academic'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { AddAcademicModal } from './add-academic-modal'
import { useQueryClient } from '@tanstack/react-query'

export function AcademicModuleView() {
  const { levelsWithCounts, sectorsWithCounts, isLoadingLevels, isLoadingSectors, isLoadingStudents } = useAcademic()
  const [activeTab, setActiveTab] = useState('levels') // or 'sectors'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const queryClient = useQueryClient()

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['academic'] })
    queryClient.invalidateQueries({ queryKey: ['students-all'] })
  }

  const handleEdit = (item) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  const handleDelete = async (id, mode) => {
    const label = mode === 'level' ? 'le niveau' : 'la filière'
    if (!confirm(`💣 Souhaitez-vous vraiment supprimer définitivement ${label} ?`)) return
    
    try {
      if (mode === 'level') await academicService.deleteLevel(id)
      else await academicService.deleteProgram(id)
      
      toast.success(`${label.charAt(0).toUpperCase() + label.slice(1)} a été supprimé.`)
      handleSuccess()
    } catch (error) {
      toast.error("Impossible de supprimer cet élément.")
    }
  }

  if (isLoadingLevels || isLoadingSectors || isLoadingStudents) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest opacity-40">Chargement Flux Académique...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">Structure <span className="text-primary italic">ACADÉMIQUE</span></h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">Architecture des niveaux, filières et spécialisations.</p>
        </div>
        
        <div className="flex gap-4">
           {/* Search Box */}
           <div className="relative group min-w-[300px] hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <input 
                  type="text" 
                  placeholder="Filtrer structure..." 
                  className="w-full pl-12 pr-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 text-[0.9rem] font-bold outline-none"
               />
           </div>
           
           <button 
             onClick={() => setIsModalOpen(true)}
             className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all"
           >
              <Plus className="w-5 h-5" />
              {activeTab === 'levels' ? 'Nouveau Niveau' : 'Nouvelle Filière'}
           </button>
        </div>
      </header>

      <AddAcademicModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        mode={activeTab === 'levels' ? 'level' : 'program'}
        initialData={selectedItem}
        onSuccess={handleSuccess}
      />

      {/* Tabs */}
      <div className="flex gap-4 px-2">
        <button 
           onClick={() => setActiveTab('levels')}
           className={cn(
             "px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
             activeTab === 'levels' ? "bg-primary text-white shadow-xl shadow-primary/20" : "glass-card hover:bg-primary/5 opacity-60 hover:opacity-100"
           )}
        >
           Niveaux (L-M-D)
        </button>
        <button 
           onClick={() => setActiveTab('sectors')}
           className={cn(
             "px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
             activeTab === 'sectors' ? "bg-primary text-white shadow-xl shadow-primary/20" : "glass-card hover:bg-primary/5 opacity-60 hover:opacity-100"
           )}
        >
           Filières & Secteurs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-1">
        {activeTab === 'levels' && levelsWithCounts.length > 0 ? (
          levelsWithCounts.map((lvl, i) => (
            <AcademicItemCard 
               key={i} 
               icon={GraduationCap} 
               title={lvl.name} 
               subtitle={lvl.description || `${lvl.code} - Structure académique`}
               badge={`ID: ${lvl.id}`}
               metadata={`${lvl.studentCount || 0} Étudiants Enrôlés`}
               color="bg-primary"
               onEdit={() => handleEdit(lvl)}
               onDelete={() => handleDelete(lvl.id, 'level')}
            />
          ))
        ) : activeTab === 'sectors' && sectorsWithCounts.length > 0 ? (
          sectorsWithCounts.map((sec, i) => (
            <AcademicItemCard 
               key={i} 
               icon={Layers} 
               title={sec.name} 
               subtitle={sec.description || `${sec.code} - Filière de formation`}
               badge={sec.status || "Active"}
               metadata={`${sec.studentCount || 0} Étudiants`}
               color="bg-indigo-500"
               onEdit={() => handleEdit(sec)}
               onDelete={() => handleDelete(sec.id, 'program')}
            />
          ))
        ) : (
          <EmptyState title={`Pas de ${activeTab === 'levels' ? 'niveaux' : 'filières'} enregistrés.`} onAdd={() => setIsModalOpen(true)} />
        )}
      </div>
    </div>
  )
}

function AcademicItemCard({ title, subtitle, icon: Icon, badge, metadata, color, onEdit, onDelete }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -5 }}>
      <GlassCard className="group relative overflow-hidden border-none ring-1 ring-(--glass-border) hover:ring-primary/40 transition-all p-8">
        <div className="flex justify-between items-start mb-6">
           <div className={cn("p-3.5 rounded-2xl shadow-xl shadow-slate-900/5 group-hover:scale-110 transition-transform duration-500", color)}>
              <Icon className="w-6 h-6 text-white" />
           </div>
           <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-(--glass-border) text-[10px] font-black uppercase tracking-widest italic opacity-60">
              {badge}
           </div>
        </div>
        
        <h3 className="text-xl font-black tracking-tight">{title}</h3>
        <p className="text-[11px] font-bold text-muted-foreground opacity-60 mt-2 uppercase tracking-tight line-clamp-2">{subtitle}</p>
        
        <div className="mt-8 pt-6 border-t border-(--glass-border) flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">{metadata}</span>
            <div className="flex gap-2">
               <button 
                onClick={onDelete}
                className="p-2.5 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all active:scale-90"
               >
                  <Trash2 className="w-4.5 h-4.5" />
               </button>
               <button 
                onClick={onEdit}
                className="p-2.5 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all active:scale-90"
               >
                  <Edit className="w-4.5 h-4.5" />
               </button>
            </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

function EmptyState({ title, onAdd }) {
  return (
    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center opacity-40">
        <Layers className="w-10 h-10" />
      </div>
      <h3 className="text-xl font-bold opacity-30">{title}</h3>
      <button 
        onClick={onAdd}
        className="text-primary font-black uppercase text-xs hover:underline tracking-widest transition-all"
      >
         Ajouter une structure
      </button>
    </div>
  )
}
