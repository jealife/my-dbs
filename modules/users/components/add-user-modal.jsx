'use client'

import { useState, useEffect } from 'react'
import { X, GraduationCap, Users, Mail, User, Key, CheckCircle2, ChevronRight, Copy, RefreshCw, BookOpen, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'
import { userService } from '@/lib/user-service'
import { toast } from 'react-hot-toast'

export function AddUserModal({ isOpen, onClose, initialRole = 'STUDENT' }) {
  const [role, setRole] = useState(initialRole)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [password, setPassword] = useState("")
  const [academicYears, setAcademicYears] = useState([])
  const [programs, setPrograms] = useState([])
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    academicYearId: '1',
    programId: '1'
  })

  // Générateur de mot de passe automatique
  const generateNewPassword = () => {
    const charset = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let retVal = ""
    for (let i = 0; i < 8; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setPassword(retVal)
  }

  // Générer un mot de passe à l'ouverture ou au changement de rôle
  useEffect(() => {
    if (isOpen) generateNewPassword()
    
    // Charger les références dynamiquement si c'est un étudiant
    if (isOpen && role === 'STUDENT') {
      const loadMetadata = async () => {
        setIsLoadingMetadata(true)
        try {
          const [yearsData, programsData] = await Promise.all([
            userService.getAcademicYears(),
            userService.getPrograms()
          ])
          setAcademicYears(yearsData || [])
          setPrograms(programsData || [])
          
          // Mettre les premiers IDs par défaut si disponibles
          if (yearsData && yearsData.length > 0) setFormData(prev => ({...prev, academicYearId: yearsData[0].id}))
          if (programsData && programsData.length > 0) setFormData(prev => ({...prev, programId: programsData[0].id}))
        } catch (error) {
          console.error("Erreur de chargement des metadata", error)
        } finally {
          setIsLoadingMetadata(false)
        }
      }
      loadMetadata()
    }
  }, [isOpen, role])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success("Copié dans le presse-papier !")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const payload = { ...formData, role, password }

    try {
      await userService.createUser(payload)
      
      setSuccess(true)
      toast.success(`${role === 'STUDENT' ? 'Étudiant' : 'Enseignant'} créé avec succès !`)
      
      setTimeout(() => {
        setSuccess(false)
        setFormData({ first_name: '', last_name: '', email: '' })
        onClose()
      }, 3000)
    } catch (error) {
      const serverMsg = error.response?.data?.message || error.response?.data?.error
      console.error("Erreur critique BDD:", serverMsg || error.message)
      toast.error(serverMsg || "Erreur serveur 500. Vérifiez vos contraintes BDD.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-xl z-[101] relative"
      >
        <GlassCard className="p-8 border-none ring-1 ring-white/10 shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <header className="mb-8 ">
            <div className="flex items-center gap-4 mb-2">
                 <div className="w-12 h-12 rounded-2xl premium-gradient p-px shrink-0">
                    <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center text-primary">
                        {role === 'STUDENT' ? <GraduationCap className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                    </div>
                </div>
                <div>
                     <h2 className="text-2xl font-black tracking-tight italic uppercase leading-none">
                        PROFIL <span className="text-primary">{role === 'STUDENT' ? 'ÉTUDIANT' : 'ENSEIGNANT'}</span>
                    </h2>
                    <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-[0.2em] mt-1 italic">
                        Synchronisation avec la Base de Données My DBS
                    </p>
                </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center text-center space-y-4"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2">
                   <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black italic">ENREGISTRÉ AVEC SUCCÈS !</h3>
                <p className="text-sm font-medium italic opacity-60">Les données ont été synchronisées dans le Cloud.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Prénom</label>
                    <div className="relative group">
                       <input 
                         required
                         type="text" 
                         value={formData.first_name}
                         onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                         className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary font-bold transition-all text-sm outline-none" 
                       />
                       <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Nom</label>
                    <div className="relative group">
                       <input 
                        required
                        type="text" 
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary font-bold transition-all text-sm outline-none" 
                       />
                       <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Email Institutionnel</label>
                    <div className="relative group">
                       <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary font-bold transition-all text-sm outline-none" 
                       />
                       <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary" />
                      </div>
                  </div>
                  
                  {role === 'STUDENT' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Année Académique</label>
                        <div className="relative group">
                          <select 
                            required
                            disabled={isLoadingMetadata || academicYears.length === 0}
                            value={formData.academicYearId || ''}
                            onChange={(e) => setFormData({...formData, academicYearId: e.target.value})}
                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary font-bold transition-all text-sm outline-none appearance-none disabled:opacity-50" 
                          >
                            {isLoadingMetadata && <option value="">Chargement...</option>}
                            {!isLoadingMetadata && academicYears.length === 0 && <option value="">⚠️ Aucune année trouvée</option>}
                            {academicYears.map(year => (
                              <option key={year.id} value={year.id}>{year.name || year.code || `Année ${year.id}`}</option>
                            ))}
                          </select>
                          <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Programme d'Études</label>
                        <div className="relative group">
                          <select 
                            required
                            disabled={isLoadingMetadata || programs.length === 0}
                            value={formData.programId || ''}
                            onChange={(e) => setFormData({...formData, programId: e.target.value})}
                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-primary font-bold transition-all text-sm outline-none appearance-none truncate pr-10 disabled:opacity-50" 
                          >
                            {isLoadingMetadata && <option value="">Chargement...</option>}
                            {!isLoadingMetadata && programs.length === 0 && <option value="">⚠️ Aucun programme trouvé</option>}
                            {programs.map(program => (
                              <option key={program.id} value={program.id}>{program.name || program.code || `Prog. ${program.id}`}</option>
                            ))}
                          </select>
                          <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Section Mot de Passe Visible */}
                <div className="p-5 rounded-2xl bg-primary/[0.03] border border-primary/10 space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                            <Key className="w-3.5 h-3.5" /> Mot de passe généré
                        </label>
                        <button type="button" onClick={generateNewPassword} className="p-1 hover:rotate-180 transition-transform duration-500 text-primary">
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-black text-primary text-sm tracking-wider">
                            {password}
                        </div>
                        <button 
                            type="button" 
                            onClick={() => copyToClipboard(password)}
                            className="px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white transition-all active:scale-95 flex items-center justify-center"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-[9px] font-bold italic opacity-40">Ce mot de passe sera crypté par le serveur après enregistrement.</p>
                </div>

                <div className="flex gap-3 pt-2">
                    <button 
                         type="button" 
                         onClick={onClose}
                         className="px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                        Annuler
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading || (role === 'STUDENT' && (academicYears.length === 0 || programs.length === 0))}
                        className="flex-1 py-4 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 group"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>CRÉER LE COMPTE</span>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
              </form>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>
    </div>
  )
}
