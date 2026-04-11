'use client'

import { AlertTriangle, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, message, itemName, loading }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md z-[101] relative"
      >
        <GlassCard className="p-0 border-none ring-1 ring-white/10 shadow-3xl bg-white dark:bg-slate-900 overflow-hidden">
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-900 dark:text-white">
                {title || 'Confirmation de suppression'}
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {message || "Êtes-vous absolument sûr de vouloir supprimer cet élément ?"}
              </p>
            </div>

            {itemName && (
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 font-black italic uppercase text-primary tracking-widest text-xs">
                {itemName}
              </div>
            )}

            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-start gap-4 text-left">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase text-red-500 tracking-wider">Action Irréversible</p>
                 <p className="text-[11px] font-bold opacity-60">Une fois supprimé, ce dossier et toutes ses données liées ne pourront plus être récupérés.</p>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button 
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800"
              >
                Annuler
              </button>
              <button 
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 px-8 py-4 rounded-2xl bg-red-500 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                   <>
                     <span>Supprimer</span>
                     <Trash2 className="w-3.5 h-3.5" />
                   </>
                )}
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
