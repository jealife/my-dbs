'use client'

import { motion } from 'framer-motion'
import { FolderOpen, FileText, Search, Filter, Upload, Download, Trash2, FileBadge, ShieldCheck, Clock, Loader2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth-hook'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsService } from '@/lib/documents-service'
import { formatDateFr } from '@/lib/api-helpers'
import { toast } from 'react-hot-toast'

const DOC_TYPE_ICONS = { DIPLOMA: '🎓', TRANSCRIPT: '📋', ID_CARD: '🪪', CONTRACT: '📜', REPORT: '📊', CERTIFICATE: '🏅', OTHER: '📁' }

export function DocumentsModuleView() {
  const { isAdmin, user } = useAuth()
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const ownerId = user?.id || user?.userId

  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ['documents', ownerId],
    queryFn: () => documentsService.getOwnerDocuments(ownerId),
    enabled: !!ownerId,
  })

  const uploadMutation = useMutation({
    mutationFn: (file) => {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('documentType', 'OTHER')
      fd.append('ownerId', ownerId)
      return documentsService.upload(fd)
    },
    onSuccess: () => { toast.success('Document uploadé !'); queryClient.invalidateQueries({ queryKey: ['documents', ownerId] }) },
    onError: err => toast.error(`Erreur: ${err.message}`),
  })

  const deleteMutation = useMutation({
    mutationFn: documentsService.deleteDocument,
    onSuccess: () => { toast.success('Supprimé.'); queryClient.invalidateQueries({ queryKey: ['documents', ownerId] }) },
    onError: err => toast.error(`Erreur: ${err.message}`),
  })

  const categories = [
    { id: 'all', label: 'Tous', count: documents.length },
    { id: 'DIPLOMA', label: 'Diplômes', count: documents.filter(d => d.documentType === 'DIPLOMA').length },
    { id: 'TRANSCRIPT', label: 'Relevés', count: documents.filter(d => d.documentType === 'TRANSCRIPT').length },
    { id: 'OTHER', label: 'Autres', count: documents.filter(d => d.documentType === 'OTHER').length },
  ]

  const filteredDocs = (activeCategory === 'all' ? documents : documents.filter(d => d.documentType === activeCategory))
    .filter(d => !searchTerm || (d.fileName || '').toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8 px-2">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter">Documents <span className="text-primary">(GED)</span></h1>
          <p className="text-muted-foreground mt-2 font-medium italic opacity-70">Gérez vos ressources académiques et documents administratifs.</p>
        </div>
        <div className="flex gap-3">
          <input ref={fileInputRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadMutation.mutate(f); e.target.value = '' }} accept=".pdf,.docx,.jpg,.png" />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending} className="px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50">
            {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Uploader
          </button>
        </div>
      </header>

      {/* Category filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {categories.map((cat, i) => (
          <GlassCard key={i} onClick={() => setActiveCategory(cat.id)} className={cn("p-5 border-none ring-1 transition-all cursor-pointer relative overflow-hidden group", activeCategory === cat.id ? "ring-primary/50 bg-primary/5" : "ring-(--glass-border) hover:ring-primary/40")}>
            <div className="text-3xl mb-3">{DOC_TYPE_ICONS[cat.id] || '📁'}</div>
            <h4 className="font-bold text-sm uppercase italic">{cat.label}</h4>
            <p className="text-[10px] opacity-40 font-black uppercase mt-1">{cat.count} fichiers</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2 flex-wrap gap-4">
            <h2 className="text-xl font-black italic tracking-tight">Mes Documents</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-slate-50 dark:bg-slate-900/40 border-none ring-1 ring-(--glass-border) rounded-xl pl-10 pr-4 py-2 text-xs font-bold outline-none focus:ring-primary/40 w-48 transition-all" />
              </div>
            </div>
          </div>

          <GlassCard className="p-0 border-none ring-1 ring-(--glass-border) shadow-xl shadow-black/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[400px]">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-(--glass-border)">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-40 italic">Nom</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-40 italic hidden md:table-cell">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-40 italic text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--glass-border)">
                  {isLoading ? (
                    <tr><td colSpan={3} className="text-center py-16"><div className="flex flex-col items-center gap-4 opacity-40"><Loader2 className="w-8 h-8 animate-spin text-primary" /><p className="text-xs font-black uppercase tracking-widest italic">Chargement...</p></div></td></tr>
                  ) : error ? (
                    <tr><td colSpan={3} className="text-center py-16 text-rose-500"><p className="text-sm font-black italic">⚠️ {error.message}</p></td></tr>
                  ) : filteredDocs.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-16 opacity-40"><p className="text-sm font-black italic uppercase tracking-widest">Aucun document trouvé.</p></td></tr>
                  ) : filteredDocs.map((doc, i) => (
                    <tr key={doc.id || i} className="group hover:bg-primary/2 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">{DOC_TYPE_ICONS[doc.documentType] || '📁'}</div>
                          <div>
                            <p className="text-[13px] font-bold truncate max-w-[200px]">{doc.fileName || doc.name || `Doc #${doc.id}`}</p>
                            <p className="text-[10px] font-bold opacity-40 uppercase">{doc.documentType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell"><span className="text-xs italic opacity-60">{formatDateFr(doc.createdAt || doc.uploadedAt)}</span></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a href={documentsService.getDownloadUrl(doc.id)} target="_blank" className="p-2 rounded-xl hover:bg-primary/10 text-primary transition-all active:scale-90"><Download className="w-4 h-4" /></a>
                          {isAdmin && <button onClick={() => deleteMutation.mutate(doc.id)} className="p-2 rounded-xl hover:bg-rose-500/10 text-rose-400 hover:text-rose-500 transition-all active:scale-90"><Trash2 className="w-4 h-4" /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-8 px-2">
          <GlassCard title="Statistiques" className="border-none ring-1 ring-(--glass-border) shadow-xl shadow-black/5">
            <div className="pt-4 space-y-4">
              {categories.slice(1).map((cat, i) => (
                <div key={i} className="flex items-center justify-between text-xs font-bold opacity-60 uppercase tracking-widest pl-2 border-l-2 border-primary">
                  <span className="flex items-center gap-2">{DOC_TYPE_ICONS[cat.id]} {cat.label}</span>
                  <span>{cat.count}</span>
                </div>
              ))}
            </div>
          </GlassCard>
          <div className="premium-gradient p-8 rounded-3xl text-white relative overflow-hidden group cursor-pointer shadow-2xl shadow-primary/30">
            <FileText className="w-12 h-12 mb-4 opacity-50 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black italic">Relevé de Notes PDF</h3>
            <p className="text-sm opacity-80 mt-2 font-medium">Téléchargez votre relevé officiel signé.</p>
            <a href={`/api/v1/pdf/transcripts/${ownerId}`} target="_blank" className="mt-6 px-5 py-2.5 bg-white text-primary rounded-xl font-black text-xs uppercase tracking-widest shadow-lg inline-block hover:bg-white/90 transition-colors">Télécharger</a>
            <div className="absolute right-[-10px] bottom-[-10px] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
