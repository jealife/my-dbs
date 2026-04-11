'use client'

import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Breadcrumb } from "@/components/breadcrumb";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Fermer la sidebar mobile lors d'un changement de route
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Verrouiller le scroll du corps quand la sidebar est ouverte
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileOpen]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      {/* Sidebar Bureau */}
      <Sidebar className="max-lg:hidden fixed left-0 top-0" />
      
      {/* Contenu Principal */}
      <div className="flex-1 w-full lg:ml-[280px] flex flex-col items-center relative transition-all duration-500">
        <Header onMenuClick={() => setIsMobileOpen(true)} />
        <main className="w-full px-4 md:px-8 pt-28 md:pt-36 pb-12 max-w-[1600px] animate-in slide-in-from-bottom-4 duration-500">
          <Breadcrumb />
          {children}
        </main>
      </div>

      {/* Sidebar Mobile (Drawer) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-100 lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] z-101 lg:hidden shadow-2xl"
            >
              <div className="relative w-full h-full border-r border-white/5" style={{backgroundColor: '#301D00'}}>
                <button 
                  onClick={() => setIsMobileOpen(false)}
                  className="absolute top-6 right-[-60px] p-3 text-white rounded-2xl shadow-2xl active:scale-90 transition-all" style={{backgroundColor: '#301D00'}}
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="w-full h-full">
                  <Sidebar className="w-full h-full border-r-0 shadow-none bg-transparent!" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
