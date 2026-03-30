import { useState, useEffect } from 'react'
import { X, Save, Layers, GraduationCap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { academicService } from '@/lib/academic-service'
import { toast } from 'react-hot-toast'

export function AddAcademicModal({ isOpen, onClose, mode = 'level', onSuccess, initialData = null }) {
  const [loading, setLoading] = useState(false)
  const isEdit = !!initialData
  
  // Level state
  const [levelData, setLevelData] = useState({
    name: '',
    code: '',
    description: '',
    startDate: '',
    endDate: '',
    currentYear: false,
    status: 'ACTIVE'
  })

  // Program state
  const [programData, setProgramData] = useState({
    name: '',
    code: '',
    description: '',
    departmentName: '',
    facultyName: '',
    level: '',
    durationInMonths: 12,
    creditsRequired: 60,
    status: 'ACTIVE'
  })

  useEffect(() => {
    if (initialData) {
      if (mode === 'level') {
        setLevelData({
          ...initialData,
          startDate: initialData.startDate || '',
          endDate: initialData.endDate || '',
        })
      } else {
        setProgramData({
          ...initialData,
        })
      }
    } else {
      // Reset if no initial data
      setLevelData({ name: '', code: '', description: '', startDate: '', endDate: '', currentYear: false, status: 'ACTIVE' })
      setProgramData({ name: '', code: '', description: '', departmentName: '', facultyName: '', level: '', durationInMonths: 12, creditsRequired: 60, status: 'ACTIVE' })
    }
  }, [initialData, mode, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'level') {
        if (isEdit) await academicService.updateLevel(initialData.id, levelData)
        else await academicService.createLevel(levelData)
        toast.success(isEdit ? "Niveau mis à jour !" : "Niveau académique créé !")
      } else {
        if (isEdit) await academicService.updateProgram(initialData.id, programData)
        else await academicService.createProgram(programData)
        toast.success(isEdit ? "Filière mise à jour !" : "Filière créée !")
      }
      if (onSuccess) onSuccess()
      onClose()
    } catch (error) {
      console.error("Error saving academic item:", error)
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const isLevel = mode === 'level'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg z-50 relative"
      >
        <GlassCard className="p-0 border-none ring-1 ring-white/10 shadow-3xl bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                {isLevel ? <GraduationCap className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight italic uppercase">
                  Nouveau {isLevel ? 'Niveau' : 'Programme'}
                </h2>
                <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">
                  Configuration de la structure académique
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {isLevel ? (
              /* LEVEL FIELDS */
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Nom du Niveau</label>
                    <input 
                      required
                      type="text" 
                      placeholder="ex: Licence 1"
                      value={levelData.name} 
                      onChange={e => setLevelData({...levelData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Code</label>
                    <input 
                      required
                      type="text" 
                      placeholder="ex: L1"
                      value={levelData.code} 
                      onChange={e => setLevelData({...levelData, code: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Date début</label>
                    <input 
                      required
                      type="date" 
                      value={levelData.startDate} 
                      onChange={e => setLevelData({...levelData, startDate: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Date fin</label>
                    <input 
                      required
                      type="date" 
                      value={levelData.endDate} 
                      onChange={e => setLevelData({...levelData, endDate: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700">
                  <input 
                    type="checkbox" 
                    id="currentYear"
                    checked={levelData.currentYear}
                    onChange={e => setLevelData({...levelData, currentYear: e.target.checked})}
                    className="w-5 h-5 accent-primary"
                  />
                  <label htmlFor="currentYear" className="text-sm font-bold cursor-pointer select-none italic text-primary">Définir comme année académique courante</label>
                </div>
              </div>
            ) : (
              /* PROGRAM FIELDS */
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Nom de la Filière</label>
                    <input 
                      required
                      type="text" 
                      placeholder="ex: Génie Logiciel"
                      value={programData.name} 
                      onChange={e => setProgramData({...programData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Code</label>
                    <input 
                      required
                      type="text" 
                      placeholder="ex: GL"
                      value={programData.code} 
                      onChange={e => setProgramData({...programData, code: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Département</label>
                    <input 
                      type="text" 
                      placeholder="ex: Informatique"
                      value={programData.departmentName} 
                      onChange={e => setProgramData({...programData, departmentName: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Niveau Cible</label>
                    <input 
                      required
                      type="text" 
                      placeholder="ex: Licence"
                      value={programData.level} 
                      onChange={e => setProgramData({...programData, level: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Durée (Mois)</label>
                    <input 
                      required
                      type="number" 
                      value={programData.durationInMonths} 
                      onChange={e => setProgramData({...programData, durationInMonths: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Crédits ECTS</label>
                    <input 
                      required
                      type="number" 
                      value={programData.creditsRequired} 
                      onChange={e => setProgramData({...programData, creditsRequired: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Description</label>
              <textarea 
                value={isLevel ? levelData.description : programData.description} 
                onChange={e => isLevel 
                  ? setLevelData({...levelData, description: e.target.value})
                  : setProgramData({...programData, description: e.target.value})
                }
                rows={2}
                placeholder="Détails supplémentaires..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none font-bold text-sm resize-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span>Confirmer la création</span>
                </>
              )}
            </button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  )
}
