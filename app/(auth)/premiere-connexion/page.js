'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, School, User, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import axios from 'axios'

const STEPS = [
  { id: 1, label: 'Bienvenue', description: 'Vérification de votre identité' },
  { id: 2, label: 'Profil', description: 'Compléter vos informations' },
  { id: 3, label: 'Sécurité', description: 'Définir votre mot de passe' },
]

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
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : 'bg-(--glass-border)'}`} />
        ))}
      </div>
      <p className={`text-xs font-black ml-1 ${textColors[strength]}`}>{labels[strength]}</p>
    </div>
  )
}

export default function PremiereConnexionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Step 1 — vérification
  const [tempCode, setTempCode] = useState('')

  // Step 2 — profil
  const [phone, setPhone] = useState('')
  const [avatar, setAvatar] = useState(null)

  // Step 3 — sécurité
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const passwordsMatch = confirm.length > 0 && password === confirm

  const handleStep1 = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await axios.post('/api/auth/verify-first-login', { token, tempCode })
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || "Code temporaire invalide.")
    } finally {
      setLoading(false)
    }
  }

  const handleStep2 = (e) => {
    e.preventDefault()
    setStep(3)
  }

  const handleStep3 = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return }
    if (password.length < 8) { setError("Minimum 8 caractères."); return }

    setLoading(true)
    setError(null)
    try {
      const res = await axios.post('/api/auth/complete-first-login', {
        token,
        newPassword: password,
        phone: phone || undefined,
      })

      // Déléguer la pose du cookie HttpOnly au serveur — jamais côté client
      const data = res.data?.data || res.data || {}
      const token = data.accessToken || data.token

      if (token) {
        await axios.post('/api/auth/session', { token, user: data.user || null }, {
          withCredentials: true,
        })
      }

      if (data.user) {
        localStorage.setItem('dbs_user', JSON.stringify(data.user))
      }

      setStep(4)
      setTimeout(() => router.replace('/overview'), 2500)
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue. Veuillez réessayer.")
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
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="premium-gradient p-4 rounded-2xl shadow-xl shadow-primary/20 mb-4">
            <School className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter italic">My School DBS</h1>
          <p className="text-muted-foreground mt-2 font-medium opacity-60">Première connexion</p>
        </div>

        {/* Stepper */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-black transition-all ${
                  step === s.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' :
                  step > s.id ? 'bg-green-500 text-white' : 'bg-(--glass-border)/20 text-muted-foreground'
                }`}>
                  {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                </div>
                <span className={`text-xs font-black hidden sm:block ${step === s.id ? 'text-primary' : 'text-muted-foreground opacity-50'}`}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 h-px mx-1 ${step > s.id ? 'bg-green-500' : 'bg-(--glass-border)'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <GlassCard className="border-none shadow-2xl ring-1 ring-(--glass-border)">
          <AnimatePresence mode="wait">
            {/* ÉTAPE 1 — Vérification */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold tracking-tight">Bienvenue sur MyDBS</h2>
                  <p className="text-sm text-muted-foreground mt-1 font-serif italic">
                    Saisissez le code temporaire reçu par email pour activer votre compte.
                  </p>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-start gap-4 text-destructive">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-xs font-black italic">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleStep1} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-70">Code temporaire</label>
                    <input
                      type="text"
                      value={tempCode}
                      onChange={(e) => setTempCode(e.target.value.toUpperCase())}
                      required
                      maxLength={12}
                      placeholder="EX: ABC123"
                      className="w-full px-4 py-4 rounded-2xl bg-(--glass-border)/10 border border-(--glass-border) focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-center text-xl font-black tracking-widest placeholder:text-sm placeholder:italic placeholder:opacity-30 placeholder:tracking-normal"
                    />
                    <p className="text-xs text-muted-foreground font-medium ml-1 opacity-60">
                      Ce code vous a été fourni par votre établissement.
                    </p>
                  </div>

                  <button type="submit" disabled={loading || !tempCode}
                    className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 group">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                      <><span>VÉRIFIER LE CODE</span><ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ÉTAPE 2 — Profil */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold tracking-tight">Complétez votre profil</h2>
                  <p className="text-sm text-muted-foreground mt-1 font-serif italic">
                    Ces informations sont optionnelles mais recommandées.
                  </p>
                </div>

                <form onSubmit={handleStep2} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-70">Numéro de téléphone</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+33 6 00 00 00 00"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-(--glass-border)/10 border border-(--glass-border) focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-bold placeholder:italic placeholder:opacity-30"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(3)}
                      className="flex-1 py-4 rounded-2xl border border-(--glass-border) font-black text-sm hover:bg-(--glass-border)/10 transition-all active:scale-95 text-muted-foreground">
                      PASSER
                    </button>
                    <button type="submit"
                      className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 flex items-center justify-center gap-2 group">
                      <span>SUIVANT</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ÉTAPE 3 — Sécurité */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold tracking-tight">Définissez votre mot de passe</h2>
                  <p className="text-sm text-muted-foreground mt-1 font-serif italic">
                    Choisissez un mot de passe sécurisé pour protéger votre compte.
                  </p>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-start gap-4 text-destructive">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-xs font-black italic">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleStep3} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-70">Nouveau mot de passe</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input type={showPassword ? 'text' : 'password'} value={password}
                        onChange={(e) => setPassword(e.target.value)} required placeholder="Minimum 8 caractères"
                        className="w-full pl-12 pr-12 py-4 rounded-2xl bg-(--glass-border)/10 border border-(--glass-border) focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-bold placeholder:italic placeholder:opacity-30" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <PasswordStrengthBar password={password} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-70">Confirmer</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input type={showConfirm ? 'text' : 'password'} value={confirm}
                        onChange={(e) => setConfirm(e.target.value)} required placeholder="Répétez le mot de passe"
                        className={`w-full pl-12 pr-12 py-4 rounded-2xl bg-(--glass-border)/10 border focus:outline-none focus:ring-4 focus:ring-primary/10 text-sm font-bold placeholder:italic placeholder:opacity-30 transition-colors ${
                          confirm.length > 0 ? passwordsMatch ? 'border-green-500/50' : 'border-destructive/50' : 'border-(--glass-border) focus:border-primary/50'
                        }`} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors">
                        {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {confirm.length > 0 && !passwordsMatch && (
                      <p className="text-xs text-destructive font-black ml-1">Les mots de passe ne correspondent pas.</p>
                    )}
                  </div>

                  <button type="submit" disabled={loading || !passwordsMatch}
                    className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 group">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                      <><span>ACTIVER MON COMPTE</span><ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ÉTAPE 4 — Succès */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-4 text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-3">Compte activé !</h2>
                <p className="text-sm text-muted-foreground font-serif italic leading-relaxed mb-8">
                  Bienvenue sur MyDBS. Votre compte est maintenant actif et sécurisé. Redirection en cours...
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
