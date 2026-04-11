'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export function SplashScreen({ finishLoading }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#301D00]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative flex flex-col items-center gap-8"
      >
        {/* Animated outer ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-40px] border-2 border-primary/20 border-t-primary rounded-full"
        />
        
        <div className="relative group">
           <Image 
             src="/logo-mydbs.png" 
             alt="MyDBS Logo" 
             width={300} 
             height={120} 
             className="object-contain drop-shadow-2xl"
             priority 
           />
           {/* Glow effect */}
           <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="space-y-2 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white text-2xl font-black italic tracking-tighter"
            >
              MY <span className="text-primary italic">DBS</span> PORTAIL
            </motion.h1>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ delay: 0.6, duration: 1.5 }}
              className="h-1 bg-primary mx-auto rounded-full shadow-[0_0_10px_rgba(255,195,14,0.5)]"
            />
            <p className="text-white/40 text-[10px] uppercase font-black tracking-[0.3em] mt-4">Pédagogie • Excellence • Avenir</p>
        </div>
      </motion.div>
    </div>
  )
}
