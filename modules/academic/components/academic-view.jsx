'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Layers, GraduationCap, Trash2, Edit, School, Users, Loader2, Check, X, ChevronRight, ArrowLeft, UserCircle } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useAcademic } from '../hooks/use-academic'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { AddAcademicModal } from './add-academic-modal'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { academicService } from '@/lib/academic-service'
import { useAuth } from '@/hooks/use-auth-hook'
import { DeleteConfirmationModal } from '@/modules/users/components/DeleteConfirmationModal'
import { toast } from 'react-hot-toast'

export function AcademicModuleView() {
  const { levelsWithCounts, sectorsWithCounts, isLoadingLevels, isLoadingSectors, isLoadingStudents, students } = useAcademic()
  const { isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('levels')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [editingCapacity, setEditingCapacity] = useState(null)
  const [drillDown, setDrillDown] = useState({ program: null, class: null })
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, mode: null, label: '' })
  const [isDeleting, setIsDeleting] = useState(false)
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false)
  const [globalValue, setGlobalValue] = useState(30)
  const [applyToAll, setApplyToAll] = useState(false)
  
  const queryClient = useQueryClient()

  const { data: allClasses = [], isLoading: loadingClasses } = useQuery({
    queryKey: ['academic', 'classes'],
    queryFn: () => academicService.getClasses(),
  })

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

  const handleDelete = (id, mode) => {
    const label = mode === 'level' ? 'le niveau' : 'la filière'
    setDeleteModal({ isOpen: true, id, mode, label })
  }

  const handleConfirmDelete = async () => {
    const { id, mode, label } = deleteModal
    setIsDeleting(true)
    try {
      if (mode === 'level') await academicService.deleteLevel(id)
      else await academicService.deleteProgram(id)
      toast.success(`${label.charAt(0).toUpperCase() + label.slice(1)} a été supprimé.`)
      setDeleteModal({ isOpen: false, id: null, mode: null, label: '' })
      handleSuccess()
    } catch {
      toast.error("Impossible de supprimer cet élément (liens existants ?)")
    } finally {
      setIsDeleting(false)
    }
  }

  const { data: defaultCap } = useQuery({
    queryKey: ['academic', 'global-quota'],
    queryFn: () => academicService.getGlobalCapacity(),
    onSuccess: (data) => setGlobalValue(data)
  })

  const globalMutation = useMutation({
    mutationFn: () => academicService.updateGlobalCapacity(globalValue, applyToAll),
    onSuccess: () => {
      toast.success("Quota global mis à jour.")
      setIsGlobalModalOpen(false)
      handleSuccess()
    }
  })
  
  const updateCapacityMutation = useMutation({
    mutationFn: ({ id, capacity }) => academicService.updateClassCapacity(id, capacity),
    onSuccess: () => {
      toast.success("Capacité mise à jour.")
      setEditingCapacity(null)
      handleSuccess()
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Erreur lors de la mise à jour")
    }
  })

  const handleUpdateCapacity = (id, value) => {
    const capacity = parseInt(value, 10)
    if (isNaN(capacity) || capacity < 1) {
      toast.error("Capacité invalide.")
      return
    }
    updateCapacityMutation.mutate({ id, capacity })
  }

  // Filter classes for selected program
  const programClasses = useMemo(() => {
    if (!drillDown.program) return []
    return allClasses.filter(c => c.programId === drillDown.program.id)
  }, [allClasses, drillDown.program])

  // Filter students for selected class or program
  const displayStudents = useMemo(() => {
    const list = Array.isArray(students) ? students : []
    if (drillDown.class) {
      return list.filter(s => s.classRoomId === drillDown.class.id || s.classRoomName === drillDown.class.name)
    }
    if (drillDown.program) {
      return list.filter(s => s.programId === drillDown.program.id || s.programName === drillDown.program.name)
    }
    return []
  }, [students, drillDown])

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
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">Gestion des niveaux, filières et classes.</p>
        </div>

        <div className="flex gap-4">
          <div className="relative group min-w-[300px] hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Chercher..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 text-[0.9rem] font-bold outline-none"
            />
          </div>

          {!drillDown.program && activeTab !== 'classes' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" />
              {activeTab === 'levels' ? 'Nouveau Niveau' : 'Nouvelle Filière'}
            </button>
          )}
        </div>
      </header>

      <AddAcademicModal
        isOpen={isModalOpen}
        onClose={closeModal}
        mode={activeTab === 'levels' ? 'level' : 'program'}
        initialData={selectedItem}
        onSuccess={handleSuccess}
      />

      <DeleteConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        title={`Supprimer ${deleteModal.label} ?`}
        message={`Êtes-vous sûr de vouloir supprimer définitivement ${deleteModal.label} ? Cette action est irréversible.`}
      />

      <GlobalQuotaModal 
        isOpen={isGlobalModalOpen}
        onClose={() => setIsGlobalModalOpen(false)}
        value={globalValue}
        setValue={setGlobalValue}
        applyAll={applyToAll}
        setApplyAll={setApplyToAll}
        onConfirm={() => globalMutation.mutate()}
        loading={globalMutation.isLoading}
      />

      {/* Main Tabs Navigation */}
      {!drillDown.program && (
        <div className="flex gap-4 px-2">
          {[
            { key: 'levels', label: 'Niveaux' },
            { key: 'sectors', label: 'Filières' },
            { key: 'classes', label: 'Classes' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key)
                setDrillDown({ program: null, class: null })
              }}
              className={cn(
                "px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                activeTab === tab.key ? "bg-primary text-white shadow-xl shadow-primary/20" : "glass-card hover:bg-primary/5 opacity-60 hover:opacity-100"
              )}
            >
              {tab.label}
            </button>
          ))}
          
          {activeTab === 'classes' && isAdmin && (
            <button 
              onClick={() => setIsGlobalModalOpen(true)}
              className="ml-auto flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5"
            >
              <Users className="w-4 h-4" />
              Quota Global
            </button>
          )}
        </div>
      )}

      {/* Drill-down Header */}
      {drillDown.program && (
        <div className="flex items-center gap-4 px-2 mb-6">
          <button 
            onClick={() => {
              if (drillDown.class) setDrillDown(prev => ({ ...prev, class: null }))
              else setDrillDown({ program: null, class: null })
            }}
            className="p-3 rounded-2xl glass-card hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
            <span className="opacity-40 cursor-pointer hover:opacity-100" onClick={() => setDrillDown({ program: null, class: null })}>Filières</span>
            <ChevronRight className="w-4 h-4 opacity-20" />
            <span className={cn(drillDown.class ? "opacity-40 cursor-pointer hover:opacity-100" : "text-primary")} onClick={() => setDrillDown(prev => ({ ...prev, class: null }))}>
              {drillDown.program.name}
            </span>
            {drillDown.class && (
              <>
                <ChevronRight className="w-4 h-4 opacity-20" />
                <span className="text-primary">{drillDown.class.name}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="space-y-10">
        
        {/* 1. Drill-down Class Selection (When program is selected) */}
        {(drillDown.program && !drillDown.class) && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-1">
            {programClasses.map((cls, i) => (
              <motion.div 
                key={cls.id || i} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                onClick={() => setDrillDown(prev => ({ ...prev, class: cls }))}
                className="cursor-pointer"
              >
                <GlassCard className="group relative overflow-hidden border-none ring-1 ring-(--glass-border) hover:ring-primary/40 transition-all p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3.5 rounded-2xl bg-violet-500 shadow-xl shadow-slate-900/5 group-hover:scale-110 transition-transform duration-500">
                      <School className="w-6 h-6 text-white" />
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                      {cls.status || 'ACTIVE'}
                    </div>
                  </div>
                  <h3 className="text-xl font-black tracking-tight">{cls.name}</h3>
                  <p className="text-[11px] font-bold text-muted-foreground opacity-60 mt-1 uppercase">{cls.code}</p>
                  <div className="mt-8 flex items-center justify-between group-hover:translate-x-1 transition-transform">
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase text-primary italic">
                          {cls.studentCount || 0} Étudiants
                        </span>
                        
                        {editingCapacity === cls.id ? (
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <input 
                              type="number"
                              defaultValue={cls.capacity || 30}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdateCapacity(cls.id, e.target.value)
                                if (e.key === 'Escape') setEditingCapacity(null)
                              }}
                              className="w-16 h-8 px-2 rounded-lg glass-card border-primary/20 text-xs font-black outline-none focus:ring-1 ring-primary/50"
                            />
                            <button 
                              onClick={() => handleUpdateCapacity(cls.id, document.activeElement.value)}
                              className="p-1.5 rounded-lg bg-primary text-white hover:scale-110 transition-all"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => setEditingCapacity(null)}
                              className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:scale-110 transition-all"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingCapacity(cls.id) }}
                            className="flex items-center gap-1.5 group/cap text-[10px] font-bold opacity-40 hover:opacity-100 transition-all"
                          >
                            <span>Capacité max: {cls.capacity || 30}</span>
                            <Edit className="w-2.5 h-2.5 group-hover/cap:scale-125 transition-transform" />
                          </button>
                        )}
                     </div>
                     <ChevronRight className="w-4 h-4 opacity-30 mt-auto" />
                  </div>
                </GlassCard>
              </motion.div>
            ))}
            {programClasses.length === 0 && (
              <div className="col-span-full py-16 glass-card rounded-3xl flex flex-col items-center justify-center border-dashed border-2 border-(--glass-border) opacity-40">
                <School className="w-10 h-10 mb-4" />
                <p className="text-sm font-black uppercase tracking-widest">Aucune classe encore créée</p>
                <p className="text-xs font-bold mt-2 italic">Les classes sont générées lors de l'inscription.</p>
              </div>
            )}
          </div>
        )}

        {/* 2. Students List (Dynamic: All Program students OR Class students) */}
        {drillDown.program && (
          <div className="px-1 animate-in fade-in slide-in-from-bottom-2">
            <GlassCard className="p-0 overflow-hidden border-none ring-1 ring-(--glass-border)">
              <div className="p-6 border-b border-(--glass-border) bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  {drillDown.class ? `Étudiants de ${drillDown.class.name}` : `Inscrits en ${drillDown.program.name}`}
                </h3>
                <span className="text-[10px] font-black bg-primary text-white px-3 py-1 rounded-full uppercase tracking-widest">
                  {displayStudents.length} Inscrits
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-(--glass-border) bg-slate-50/20">
                      <th className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Nom</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Matricule</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Classe</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--glass-border)">
                    {displayStudents.map((s, idx) => (
                      <tr key={s.id || idx} className="hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <UserCircle className="w-6 h-6 opacity-20" />
                              <span className="text-sm font-bold">{s.firstName} {s.lastName}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <code className="text-[10px] font-black bg-slate-100 px-2 py-0.5 rounded text-primary">
                             {s.studentNumber || s.userCode || `ID-${s.id}`}
                           </code>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold opacity-60">
                           {s.classRoomName || (s.classRoomId ? `Classe #${s.classRoomId}` : (
                             <span className="text-rose-500/40 italic">Non classé</span>
                           ))}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase">
                             {s.status || 'INSCRIT'}
                           </span>
                        </td>
                      </tr>
                    ))}
                    {displayStudents.length === 0 && (
                      <tr><td colSpan={4} className="py-20 text-center text-sm font-bold opacity-20 italic">Aucun élève trouvé</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}

        {/* 3. Initial View (Summary Cards) */}
        {!drillDown.program && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-1">
            {activeTab === 'levels' ? (
               levelsWithCounts.map((lvl, i) => (
                 <AcademicItemCard
                   key={lvl.id || i}
                   icon={GraduationCap}
                   title={lvl.name}
                   subtitle={lvl.code}
                   badge={`ID: ${lvl.id}`}
                   metadata={`${lvl.studentCount || 0} Étudiants`}
                   color="bg-primary"
                   onEdit={() => handleEdit(lvl)}
                   onDelete={() => handleDelete(lvl.id, 'level')}
                 />
               ))
            ) : activeTab === 'sectors' ? (
              sectorsWithCounts.map((sec, i) => (
                <AcademicItemCard
                  key={sec.id || i}
                  icon={Layers}
                  title={sec.name}
                  subtitle={sec.code}
                  badge={sec.status || "Active"}
                  metadata={`${sec.studentCount || 0} Inscrits`}
                  color="bg-indigo-500"
                  onClick={() => setDrillDown({ program: sec, class: null })}
                  onEdit={() => handleEdit(sec)}
                  onDelete={() => handleDelete(sec.id, 'program')}
                />
              ))
            ) : (
              allClasses.map((cls, i) => (
                <div key={cls.id || i} onClick={() => { setDrillDown({ program: {id: cls.programId, name: cls.programName}, class: cls }) }} className="cursor-pointer">
                  <AcademicItemCard
                    icon={School}
                    title={cls.name}
                    subtitle={cls.code}
                    badge={cls.status || "ACTIVE"}
                    metadata={`${cls.studentCount || 0} Élèves`}
                    color="bg-violet-500"
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function GlobalQuotaModal({ isOpen, onClose, value, setValue, applyAll, setApplyAll, onConfirm, loading }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md glass-card rounded-3xl p-8 shadow-2xl border-none ring-1 ring-(--glass-border)"
      >
        <div className="flex justify-between items-center mb-8">
           <h3 className="text-xl font-black tracking-tight italic uppercase">Quota Global <span className="text-primary italic">Classes</span></h3>
           <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X className="w-5 h-5 opacity-40"/></button>
        </div>

        <div className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-40 ml-1">Capacité par défaut (Nouvelles classes)</label>
              <input 
                type="number"
                value={value}
                onChange={e => setValue(e.target.value)}
                className="w-full h-14 px-6 rounded-2xl glass-card border-(--glass-border) focus:border-primary/50 text-lg font-black outline-none"
              />
           </div>

           <label className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/5 group cursor-pointer border border-amber-500/10 hover:border-amber-500/30 transition-all">
              <input 
                type="checkbox"
                checked={applyAll}
                onChange={e => setApplyAll(e.target.checked)}
                className="w-5 h-5 rounded-lg border-amber-500/20 text-amber-500 focus:ring-amber-500/20"
              />
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase text-amber-600">Appliquer à toutes les classes</span>
                <span className="text-[9px] font-bold opacity-60 italic">Met à jour instantanément toutes les classes actives.</span>
              </div>
           </label>

           <div className="flex gap-4 pt-4">
              <button 
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl glass-card font-black text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={onConfirm}
                disabled={loading}
                className="flex-[2] py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin"/>}
                Enregistrer le cota
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  )
}

function AcademicItemCard({ title, subtitle, icon: Icon, badge, metadata, color, onClick, onEdit, onDelete }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className={cn("h-full", onClick && "cursor-pointer")}
    >
      <GlassCard className="group h-full relative overflow-hidden border-none ring-1 ring-(--glass-border) hover:ring-primary/40 transition-all p-8 flex flex-col">
        <div className="flex justify-between items-start mb-6">
           <div className={cn("p-3.5 rounded-2xl shadow-xl shadow-slate-900/5 group-hover:scale-110 transition-transform duration-500", color)}>
              <Icon className="w-6 h-6 text-white" />
           </div>
           <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-(--glass-border) text-[10px] font-black uppercase tracking-widest italic opacity-60">
              {badge}
           </div>
        </div>
        
        <h3 className="text-xl font-black tracking-tight">{title}</h3>
        <p className="text-[11px] font-bold text-muted-foreground opacity-60 mt-2 uppercase tracking-tight">{subtitle}</p>
        
        <div className="mt-auto pt-8 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">{metadata}</span>
            {(onEdit || onDelete) && (
              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  {onDelete && (
                    <button onClick={onDelete} className="p-2.5 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all active:scale-90">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {onEdit && (
                    <button onClick={onEdit} className="p-2.5 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all active:scale-90">
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
              </div>
            )}
        </div>
      </GlassCard>
    </motion.div>
  )
}

function EmptyState({ title, onAdd }) {
  return (
    <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center opacity-40">
        <Layers className="w-10 h-10" />
      </div>
      <h3 className="text-xl font-bold opacity-30">{title}</h3>
      {onAdd && (
        <button onClick={onAdd} className="text-primary font-black uppercase text-xs hover:underline tracking-widest">
           Ajouter un élément
        </button>
      )}
    </div>
  )
}
