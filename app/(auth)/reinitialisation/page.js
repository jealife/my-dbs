'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, School, ShieldAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import Link from 'next/link'
import axios from 'axios'

function PasswordStrengthBar({ password }) {
  const getStrength = (pwd) => {
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score
  }

  const strength = getStrength(password)
  const labels = ['', 'Très faible', 'Faible', 'Correct', 'Fort', 'Très fort']
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
  const textColors = ['', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500']

  if (!password) return null

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= strength ? colors[strength] : 'bg-(--glass-border)'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-black ml-1 ${textColors[strength]}`}>
        {labels[strength]}
      </p>
    </div>
  )
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const passwordsMatch = confirm.length > 0 && password === confirm

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      await axios.post('/api/auth/reset-password', { token, newPassword: password })
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || "Le lien est invalide ou expiré. Veuillez recommencer.")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-purple-500/5 -z-10" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <GlassCard className="border-none shadow-2xl ring-1 ring-(--glass-border) text-center py-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-3">Lien invalide</h2>
            <p className="text-sm text-muted-foreground font-serif italic mb-8">
              Ce lien de réinitialisation est invalide ou a expiré.
            </p>
            <Link
              href="/mot-de-passe-oublie"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-sm shadow-lg hover:shadow-primary/40 transition-all"
            >
              Demander un nouveau lien
            </Link>
          </GlassCard>
        </motion.div>
      </div>
    )
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
          <div className="premium-gradient p-4 rounded-2xl shadow-xl shadow-primary/20 mb-4">
            <School className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter italic">My School DBS</h1>
          <p className="text-muted-foreground mt-2 font-medium opacity-60">Nouveau mot de passe</p>
        </div>

        <GlassCard className="border-none shadow-2xl ring-1 ring-(--glass-border)">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold tracking-tight">Créer un nouveau mot de passe</h2>
                  <p className="text-sm text-muted-foreground mt-1 font-medium font-serif italic">
                    Choisissez un mot de passe sécurisé d'au moins 8 caractères.
                  </p>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-start gap-4 text-destructive"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-xs font-black italic">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-70">
                      Nouveau mot de passe
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Minimum 8 caractères"
                        className="w-full pl-12 pr-12 py-4 rounded-2xl bg-(--glass-border)/10 border border-(--glass-border) focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-bold placeholder:italic placeholder:opacity-30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <PasswordStrengthBar password={password} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-70">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                        placeholder="Répétez le mot de passe"
                        className={`w-full pl-12 pr-12 py-4 rounded-2xl bg-(--glass-border)/10 border focus:outline-none focus:ring-4 focus:ring-primary/10 text-sm font-bold placeholder:italic placeholder:opacity-30 transition-colors ${
                          confirm.length > 0
                            ? passwordsMatch
                              ? 'border-green-500/50 focus:border-green-500/70'
                              : 'border-destructive/50 focus:border-destructive/70'
                            : 'border-(--glass-border) focus:border-primary/50'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {confirm.length > 0 && !passwordsMatch && (
                      <p className="text-xs text-destructive font-black ml-1">Les mots de passe ne correspondent pas.</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !passwordsMatch}
                    className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 group"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>ENREGISTRER LE MOT DE PASSE</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4 text-center"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-3">Mot de passe mis à jour !</h2>
                <p className="text-sm text-muted-foreground font-serif italic leading-relaxed mb-6">
                  Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la connexion.
                </p>
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        <p className="mt-10 text-center text-xs font-bold opacity-30 hover:opacity-100 transition-opacity cursor-default font-serif italic">
          &copy; 2026 My DBS Inc. Tous droits réservés.
        </p>
      </motion.div>
    </div>
  )
}
