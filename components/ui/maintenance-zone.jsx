'use client'

import { AlertTriangle, Hammer, RefreshCw } from 'lucide-react'
import { GlassCard } from './glass-card'
import { useAuth } from '@/hooks/use-auth-hook'
import { motion } from 'framer-motion'

export function MaintenanceZone({ 
  error, 
  reset, 
  title = "Accès Temporairement Limité", 
  message = "Cette section est actuellement en cours de maintenance technique pour améliorer votre expérience. Revenez dans quelques instants.",
  zone = "Service" 
}) {
  const { isAdmin } = useAuth()

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full py-12"
    >
      <GlassCard className="max-w-2xl mx-auto border-amber-500/20 bg-amber-500/5 overflow-hidden">
        <div className="flex flex-col items-center text-center p-8">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center mb-6 relative">
            <Hammer className="w-10 h-10 text-amber-500 animate-bounce" />
            <div className="absolute -top-1 -right-1">
               <AlertTriangle className="w-6 h-6 text-amber-500 fill-amber-500/20" />
            </div>
          </div>
          
          <h2 className="text-2xl font-black tracking-tight mb-2 uppercase italic">{title}</h2>
          <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            {zone} en maintenance
          </div>
          
          <p className="text-muted-foreground font-serif italic text-lg leading-relaxed mb-8 opacity-80">
            {message}
          </p>

          <div className="flex flex-col w-full gap-4">
            <button 
              onClick={() => reset ? reset() : window.location.reload()}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer la connexion
            </button>

            {isAdmin && error && (
              <div className="mt-8 w-full text-left">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Mode Admin : Rapport d'erreur Technique</span>
                </div>
                <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 font-mono text-[11px] text-rose-600 dark:text-rose-400 break-all whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
                  <p className="font-bold mb-2">Erreur : {error.message || "Erreur inconnue"}</p>
                  {error.response?.data && (
                    <p className="opacity-70">Backend Response: {JSON.stringify(error.response.data, null, 2)}</p>
                  )}
                  {error.stack && (
                    <p className="mt-4 opacity-40 text-[9px] leading-tight line-clamp-4">{error.stack}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
