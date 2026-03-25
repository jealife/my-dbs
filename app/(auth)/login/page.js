'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { School, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { authService } from '@/lib/auth-service'
import Link from 'next/link'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  // Test de connexion silencieux au backend au chargement
  useEffect(() => {
    const testConnection = async () => {
      try {
        await authService.testConnection();
        console.log("✅ [MyDBS] Connexion au backend établie avec succès.");
      } catch (error) {
        console.warn("⚠️ [MyDBS] Impossible de contacter le backend à l'adresse habituelle.");
      }
    };
    testConnection();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Intégration backend réelle
      await authService.login(email, password)
      router.replace('/overview')
    } catch (err) {
      setError(err.message || "Impossible de se connecter au serveur backend.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-purple-500/5 -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
           <div className="premium-gradient p-4 rounded-2xl shadow-xl shadow-primary/20 mb-4 transition-transform hover:rotate-12 cursor-pointer">
              <School className="w-10 h-10 text-white" />
           </div>
           <h1 className="text-3xl font-black tracking-tighter italic">My School DBS</h1>
           <p className="text-muted-foreground mt-2 font-medium opacity-60">Gestion Académique de Nouvelle Génération</p>
        </div>

        <GlassCard className="border-none shadow-2xl ring-1 ring-(--glass-border)">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Bienvenue</h2>
            <p className="text-sm text-muted-foreground mt-1 font-medium font-serif italic">Connectez-vous pour accéder à votre espace.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-8 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-start gap-4 text-destructive"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs font-black italic">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-70">Email Institutionnel</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@mydbs.com"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-(--glass-border)/10 border border-(--glass-border) focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-bold placeholder:italic placeholder:opacity-30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-70">Mot de passe</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Admin@123456"
                  className="w-full pl-12 pr-12 py-4 rounded-2xl bg-(--glass-border)/10 border border-(--glass-border) focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-bold placeholder:opacity-30"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
               <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-(--glass-border) text-primary focus:ring-primary/20" />
                  <span className="text-xs font-bold opacity-60 group-hover:opacity-100 transition-opacity italic">Se souvenir</span>
               </label>
               <button type="button" className="text-xs font-black text-primary hover:underline underline-offset-4">Oublié ?</button>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>SE CONNECTER</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

        </GlassCard>

        <p className="mt-10 text-center text-xs font-bold opacity-30 hover:opacity-100 transition-opacity cursor-default font-serif italic">
           &copy; 2026 My DBS Inc. Tous droits réservés.
        </p>
        <div className="mt-4 text-center">
           <Link href="/admin-login" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all opacity-20 hover:opacity-100">
              Accès Console Administrative
           </Link>
        </div>
      </motion.div>
    </div>
  )
}
