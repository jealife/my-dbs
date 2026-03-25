'use client'

import { Search, Bell, User, LayoutGrid, Menu, X } from 'lucide-react'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './sidebar'
import { useAuth } from '@/hooks/use-auth-hook'
import Link from 'next/link'

export function Header({ onMenuClick }) {
  const { user } = useAuth()

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[280px] bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md z-40 p-4 md:p-6 pb-2 transition-all duration-300">
      <div className="glass-card px-4 md:px-6 py-4 flex items-center justify-between gap-4 border-(--glass-border) shadow-xl shadow-slate-900/5">
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-3 rounded-2xl glass-card hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90 border-(--glass-border)"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="relative group max-w-lg w-full hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher dossiers, cours, notes..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-100/30 dark:bg-slate-800/20 border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-primary/50 transition-all focus:outline-none focus:ring-4 focus:ring-primary/10 text-[0.92rem] font-bold"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="relative p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 group">
            <Bell className="w-5.5 h-5.5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></span>
          </button>
          
          <div className="h-8 w-px bg-(--glass-border) opacity-50 hidden sm:block"></div>
          

          
          <Link href="/profile" className="flex items-center gap-3 p-1.5 pr-4 rounded-full glass-card hover:border-primary/50 transition-all active:scale-95 group border-(--glass-border)">
            <div className="w-9 h-9 premium-gradient rounded-full flex items-center justify-center text-white font-bold group-hover:rotate-12 transition-transform shadow-md">
              {user ? (user.first_name?.[0] || <User className="w-5 h-5" />) : <User className="w-5 h-5" />}
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none gap-0.5">
              <span className="text-[0.85rem] font-black truncate max-w-[120px] uppercase tracking-tight">
                {user ? user.last_name : 'Profil'}
              </span>
              <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{user?.role || 'Guest'}</span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
