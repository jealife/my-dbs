'use client'

import { useAuth } from '@/hooks/use-auth-hook'
import { GlassCard } from '@/components/ui/glass-card'
import { User, Mail, Shield, Smartphone, MapPin, Calendar, Camera, Key, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function ProfileView() {
  const { user, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  if (!user) return null

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">Mon <span className="text-primary italic">PROFIL</span></h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-60">Gérez vos informations personnelles et vos paramètres de sécurité.</p>
        </div>
        
        <div className="flex gap-4">
           <button 
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl glass-card font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all border-(--glass-border)"
           >
              {isEditing ? 'Annuler Modifications' : 'Modifier Profil'}
           </button>
           <button 
              onClick={logout}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-500/10 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-red-500/10"
           >
              <LogOut className="w-5 h-5" />
              Déconnexion
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Profile Card Summary */}
        <div className="xl:col-span-1 space-y-6">
           <GlassCard className="text-center p-10 relative overflow-hidden group border-none ring-1 ring-(--glass-border)">
              <div className="relative inline-block mx-auto mb-6 group">
                 <div className="w-32 h-32 rounded-full premium-gradient p-1 shadow-2xl shadow-primary/30 group-hover:scale-105 transition-transform duration-500">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-4xl font-black italic">
                       {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                 </div>
                 <button className="absolute bottom-1 right-1 p-2.5 rounded-xl bg-primary text-white shadow-xl hover:scale-110 active:scale-90 transition-all">
                    <Camera className="w-5 h-5" />
                 </button>
              </div>

              <h2 className="text-2xl font-black tracking-tight">{user.first_name} {user.last_name}</h2>
              <div className="mt-2 flex items-center justify-center gap-2">
                 <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.15em] italic">
                    {user.role}
                 </span>
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">
                    #{user.user_code}
                 </span>
              </div>
              
              <div className="mt-10 space-y-3 pt-6 border-t border-(--glass-border)">
                 <div className="flex items-center gap-3 text-sm font-medium opacity-60 hover:opacity-100 transition-opacity">
                    <Mail className="w-4.5 h-4.5 text-primary" />
                    <span>{user.email}</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm font-medium opacity-60 hover:opacity-100 transition-opacity">
                    <Smartphone className="w-4.5 h-4.5 text-primary" />
                    <span>+237 6XX-XX-XX-XX</span>
                 </div>
              </div>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
           </GlassCard>

           <GlassCard title="Sytème & Badge" description="Accès via technologie sans contact NFC." className="border-none ring-1 ring-(--glass-border)">
              <div className="mt-6 flex flex-col items-center p-6 rounded-3xl bg-slate-100 dark:bg-slate-900/50 border-2 border-dashed border-(--glass-border) relative group overflow-hidden">
                 <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 animate-pulse">
                    <Shield className="w-8 h-8" />
                 </div>
                 <p className="text-xs font-black uppercase tracking-widest opacity-40">Badge Virtuel Activé</p>
                 <div className="mt-4 flex gap-1">
                    {[1, 2, 3, 4, 5, 6].map((_, i) => (
                      <div key={i} className="w-1 h-4 bg-primary/30 rounded-full" />
                    ))}
                 </div>
              </div>
           </GlassCard>
        </div>

        {/* Details Form / Sections */}
        <div className="xl:col-span-2 space-y-8">
           <GlassCard title="Informations Personnelles" className="border-none ring-1 ring-(--glass-border)">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                 <ProfileField label="Code Utilisateur" value={user.user_code} readonly />
                 <ProfileField label="Rôle Institutionnel" value={user.role} readonly />
                 <ProfileField label="Prénom" value={user.first_name} isEditing={isEditing} />
                 <ProfileField label="Nom" value={user.last_name} isEditing={isEditing} />
                 <ProfileField label="Statut" value={user.status || 'Actif'} readonly />
                 <ProfileField label="Date d'Inscription" value={user.created_at || 'Janvier 2026'} readonly />
              </div>
           </GlassCard>

           <GlassCard title="Paramètres de Sécurité" description="Gérez votre accès et vos authentifications." className="border-none ring-1 ring-(--glass-border)">
              <div className="space-y-6 pt-6">
                 <div className="flex items-center justify-between p-4 rounded-3xl bg-primary/5 border border-primary/10 group cursor-pointer hover:bg-primary/10 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Key className="w-5.5 h-5.5" />
                       </div>
                       <div>
                          <h4 className="text-sm font-black uppercase tracking-tight">Modifier Mot de Passe</h4>
                          <p className="text-[10px] font-medium opacity-40 italic">Dernière modification il y a 3 mois</p>
                       </div>
                    </div>
                    <button className="px-4 py-2 bg-white dark:bg-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Gérer</button>
                 </div>
                 
                 <div className="flex items-center justify-between p-4 rounded-3xl bg-amber-500/5 border border-amber-500/10 group cursor-pointer hover:bg-amber-500/10 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                          <Shield className="w-5.5 h-5.5" />
                       </div>
                       <div>
                          <h4 className="text-sm font-black uppercase tracking-tight">Authentification à 2 Facteurs (2FA)</h4>
                          <p className="text-[10px] font-medium opacity-40 italic">Non activé - Protégez votre compte DBS</p>
                       </div>
                    </div>
                    <button className="px-4 py-2 bg-white dark:bg-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Activer</button>
                 </div>
              </div>
           </GlassCard>
        </div>
      </div>
    </div>
  )
}

function ProfileField({ label, value, readonly, isEditing }) {
  return (
    <div className="space-y-2">
       <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50 italic">{label}</label>
       <div className={cn(
         "w-full px-5 py-3.5 rounded-2xl border transition-all text-[0.92rem] font-bold",
         readonly ? "bg-slate-50 dark:bg-slate-900/40 border-(--glass-border) opacity-60" : "bg-white dark:bg-slate-900 border-(--glass-border)",
         isEditing && !readonly ? "ring-2 ring-primary/20 border-primary shadow-xl" : ""
       )}>
          {isEditing && !readonly ? (
            <input type="text" defaultValue={value} className="bg-transparent w-full outline-none" />
          ) : (
            <span>{value}</span>
          )}
       </div>
    </div>
  )
}
