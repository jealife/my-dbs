'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Trash2 } from 'lucide-react'
import { GlassCard } from './glass-card'

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmation", 
  message = "Êtes-vous sûr ?", 
  confirmText = "Confirmer",
  cancelText = "Annuler",
  loading = false,
  variant = "danger" 
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-sm z-10 relative"
      >
        <GlassCard className="p-6 border-none ring-1 ring-white/10 shadow-2xl bg-white dark:bg-slate-900">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center text-center space-y-4 pt-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
            }`}>
              {variant === 'danger' ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-black italic uppercase tracking-tight">{title}</h3>
              <p className="text-sm font-medium opacity-60 px-2">{message}</p>
            </div>

            <div className="flex gap-3 w-full pt-2">
              <button 
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                {cancelText}
              </button>
              <button 
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
                  variant === 'danger' ? 'bg-red-500 shadow-red-500/20' : 'bg-primary shadow-primary/20'
                }`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : confirmText}
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
