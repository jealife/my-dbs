'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderOpen, FileText, Search, Upload, Download, Trash2,
  ShieldCheck, Loader2, X, History, Plus, Users, Eye
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth-hook'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsService } from '@/lib/documents-service'
import { formatDateFr } from '@/lib/api-helpers'
import { toast } from 'react-hot-toast'
import { MaintenanceZone } from '@/components/ui/maintenance-zone'
import { DocumentViewer } from './document-viewer'

const DOC_TYPES = [
  { id: 'DIPLOMA',     label: 'Diplômes',    icon: '🎓' },
  { id: 'TRANSCRIPT',  label: 'Relevés',     icon: '📋' },
  { id: 'ID_CARD',     label: 'Identité',    icon: '🪪' },
  { id: 'CONTRACT',    label: 'Contrats',    icon: '📜' },
  { id: 'REPORT',      label: 'Rapports',    icon: '📊' },
  { id: 'CERTIFICATE', label: 'Certificats', icon: '🏅' },
  { id: 'OTHER',       label: 'Autres',      icon: '📁' },
]
const DOC_TYPE_ICONS = Object.fromEntries(DOC_TYPES.map(t => [t.id, t.icon]))

const REF_TYPES = ['STUDENT', 'TEACHER', 'COURSE', 'COHORT', 'PROGRAM']

const AUDIT_COLORS = {
  DOWNLOAD: 'bg-blue-500',
  UPLOAD:   'bg-emerald-500',
  DELETE:   'bg-rose-500',
  VIEW:     'bg-indigo-400',
}

export function DocumentsModuleView() {
  const { isAdmin, isScolarity, isTeacher, isStudent, user } = useAuth()
  const queryClient = useQueryClient()
  const fileInputRef   = useRef(null)
  const versionFileRef = useRef(null)

  const ownerId  = user?.id || user?.userId
  const canManage = isAdmin || isScolarity

  // UI state
  const [searchTerm,       setSearchTerm]       = useState('')
  const [activeCategory,   setActiveCategory]   = useState('all')
  const [adminTab,         setAdminTab]         = useState('own')   // 'own' | 'search' | 'reference'
  const [deleteConfirm,    setDeleteConfirm]    = useState(null)

  // Upload modal
  const [showUpload,  setShowUpload]  = useState(false)
  const [uploadFile,  setUploadFile]  = useState(null)
  const [uploadForm,  setUploadForm]  = useState({ documentType: 'OTHER', title: '' })

  // Viewer
  const [viewerDoc, setViewerDoc] = useState(null)

  // Modals
  const [auditDocId,        setAuditDocId]        = useState(null)
  const [versionDocId,      setVersionDocId]      = useState(null)
  const [showVersionUpload, setShowVersionUpload] = useState(false)

  // Admin search
  const [globalSearch, setGlobalSearch] = useState({ keyword: '', type: '', ownerId: '' })
  const [refSearch,    setRefSearch]    = useState({ referenceType: 'STUDENT', referenceId: '' })

  // ── Queries ──────────────────────────────────────────────
  const { data: ownDocs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['documents', 'own', ownerId],
    queryFn:  () => documentsService.getOwnerDocuments(ownerId),
    enabled:  !!ownerId,
  })

  const { data: searchResults = [], isLoading: loadingSearch } = useQuery({
    queryKey: ['documents', 'search', globalSearch],
    queryFn:  () => documentsService.search({
      keyword: globalSearch.keyword  || undefined,
      type:    globalSearch.type     || undefined,
      ownerId: globalSearch.ownerId  || undefined,
    }),
    enabled: canManage && adminTab === 'search',
  })

  const { data: refDocs = [], isLoading: loadingRef } = useQuery({
    queryKey: ['documents', 'ref', refSearch.referenceType, refSearch.referenceId],
    queryFn:  () => documentsService.getByReference(refSearch.referenceType, refSearch.referenceId),
    enabled:  (canManage || isTeacher) && adminTab === 'reference' && !!refSearch.referenceId,
  })

  const { data: auditLog = [], isLoading: loadingAudit } = useQuery({
    queryKey: ['documents', 'audit', auditDocId],
    queryFn:  () => documentsService.getAudit(auditDocId),
    enabled:  !!auditDocId && canManage,
  })

  const { data: versions = [], isLoading: loadingVersions } = useQuery({
    queryKey: ['documents', 'versions', versionDocId],
    queryFn:  () => documentsService.getVersions(versionDocId, ownerId),
    enabled:  !!versionDocId,
  })

  // ── Mutations ─────────────────────────────────────────────
  const uploadMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      fd.append('file', uploadFile)
      fd.append('documentType', uploadForm.documentType)
      fd.append('ownerId', ownerId)
      fd.append('title', uploadForm.title || uploadFile.name)
      return documentsService.upload(fd)
    },
    onSuccess: () => {
      toast.success('Document uploadé !')
      setShowUpload(false); setUploadFile(null)
      setUploadForm({ documentType: 'OTHER', title: '' })
      queryClient.invalidateQueries({ queryKey: ['documents', 'own', ownerId] })
    },
    onError: err => toast.error(`Upload échoué : ${err.message}`),
  })

  const uploadVersionMutation = useMutation({
    mutationFn: ({ docId, file }) => {
      const fd = new FormData()
      fd.append('file', file)
      return documentsService.uploadVersion(docId, fd)
    },
    onSuccess: () => {
      toast.success('Nouvelle version uploadée !')
      setShowVersionUpload(false)
      queryClient.invalidateQueries({ queryKey: ['documents', 'versions', versionDocId] })
      queryClient.invalidateQueries({ queryKey: ['documents', 'own', ownerId] })
    },
    onError: err => toast.error(`Erreur : ${err.message}`),
  })

  const deleteMutation = useMutation({
    mutationFn: (docId) => documentsService.deleteDocument(docId, ownerId),
    onSuccess: () => {
      toast.success('Document supprimé.')
      setDeleteConfirm(null)
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
    onError: err => toast.error(`Erreur : ${err.message}`),
  })

  if (error) return (
    <div className="p-8">
      <MaintenanceZone error={error} reset={refetch} zone="Documents (GED)" />
    </div>
  )

  // Active document list depending on tab
  const activeDocs    = adminTab === 'search' ? searchResults : adminTab === 'reference' ? refDocs : ownDocs
  const activeLoading = adminTab === 'search' ? loadingSearch : adminTab === 'reference' ? loadingRef : isLoading

  const categories = [
    { id: 'all', label: 'Tous', icon: '📁', count: activeDocs.length },
    ...DOC_TYPES.map(t => ({ ...t, count: activeDocs.filter(d => d.documentType === t.id).length })),
  ]

  const filteredDocs = (activeCategory === 'all' ? activeDocs : activeDocs.filter(d => d.documentType === activeCategory))
    .filter(d => !searchTerm || (d.title || d.fileName || d.name || '').toLowerCase().includes(searchTerm.toLowerCase()))

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0]
    if (f) { setUploadFile(f); setShowUpload(true) }
    e.target.value = ''
  }

  const closeUpload = () => { setShowUpload(false); setUploadFile(null) }

  // ── Render ────────────────────────────────────────────────
  return (
    <>
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter">Documents <span className="text-primary">(GED)</span></h1>
          <p className="text-muted-foreground mt-2 font-medium italic opacity-70">
            Gérez vos ressources académiques et documents administratifs.
          </p>
        </div>
        <div className="flex gap-3">
          <input ref={fileInputRef} type="file" className="hidden"
            onChange={handleFileSelect} accept=".pdf,.docx,.jpg,.jpeg,.png,.xlsx" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Uploader
          </button>
        </div>
      </header>

      {/* Admin / Teacher tabs */}
      {(canManage || isTeacher) && (
        <div className="flex bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-1 gap-1 w-fit">
          {[
            { id: 'own',       label: 'Mes Documents' },
            ...(canManage ? [{ id: 'search', label: 'Recherche Globale' }] : []),
            { id: 'reference', label: 'Par Entité' },
          ].map(tab => (
            <button key={tab.id}
              onClick={() => { setAdminTab(tab.id); setActiveCategory('all'); setSearchTerm('') }}
              className={cn(
                'px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                adminTab === tab.id
                  ? 'bg-white dark:bg-slate-950 text-primary shadow'
                  : 'text-slate-500 hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Global search panel (admin) */}
      {adminTab === 'search' && canManage && (
        <GlassCard className="border-none ring-1 ring-(--glass-border) p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Mot-clé</label>
              <input type="text" placeholder="Nom du fichier..."
                value={globalSearch.keyword}
                onChange={e => setGlobalSearch(p => ({ ...p, keyword: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-900/40 ring-1 ring-(--glass-border) rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Type</label>
              <select value={globalSearch.type}
                onChange={e => setGlobalSearch(p => ({ ...p, type: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-900/40 ring-1 ring-(--glass-border) rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-primary/50">
                <option value="">Tous les types</option>
                {DOC_TYPES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">ID Propriétaire</label>
              <input type="number" placeholder="ID utilisateur..."
                value={globalSearch.ownerId}
                onChange={e => setGlobalSearch(p => ({ ...p, ownerId: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-900/40 ring-1 ring-(--glass-border) rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-primary/50" />
            </div>
          </div>
        </GlassCard>
      )}

      {/* Reference search panel (admin / teacher) */}
      {adminTab === 'reference' && (canManage || isTeacher) && (
        <GlassCard className="border-none ring-1 ring-(--glass-border) p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Type d'entité</label>
              <select value={refSearch.referenceType}
                onChange={e => setRefSearch(p => ({ ...p, referenceType: e.target.value, referenceId: '' }))}
                className="w-full bg-slate-50 dark:bg-slate-900/40 ring-1 ring-(--glass-border) rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-primary/50">
                {REF_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">ID de l'entité</label>
              <input type="number" placeholder={`ID ${refSearch.referenceType}...`}
                value={refSearch.referenceId}
                onChange={e => setRefSearch(p => ({ ...p, referenceId: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-900/40 ring-1 ring-(--glass-border) rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-primary/50" />
            </div>
          </div>
          {!refSearch.referenceId && (
            <p className="text-[10px] italic opacity-40 font-bold mt-3">Entrez un ID pour afficher les documents associés.</p>
          )}
        </GlassCard>
      )}

      {/* Category filters — wrap on desktop, scroll on mobile */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl ring-1 font-black text-[11px] uppercase tracking-wider transition-all whitespace-nowrap',
              activeCategory === cat.id
                ? 'ring-primary/50 bg-primary/5 text-primary'
                : 'ring-(--glass-border) hover:ring-primary/30'
            )}
          >
            <span>{cat.icon}</span>
            {cat.label}
            <span className={cn(
              'px-1.5 py-0.5 rounded-full text-[9px] font-black',
              activeCategory === cat.id ? 'bg-primary/20 text-primary' : 'bg-slate-100 dark:bg-slate-800 opacity-60'
            )}>{cat.count}</span>
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Document table */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-1 flex-wrap gap-4">
            <h2 className="text-xl font-black italic tracking-tight">
              {adminTab === 'search'
                ? 'Résultats de recherche'
                : adminTab === 'reference'
                  ? `Documents — ${refSearch.referenceType} #${refSearch.referenceId || '?'}`
                  : 'Mes Documents'}
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
              <input type="text" placeholder="Filtrer par nom..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900/40 ring-1 ring-(--glass-border) rounded-xl pl-10 pr-4 py-2 text-xs font-bold outline-none focus:ring-primary/40 w-48 transition-all" />
            </div>
          </div>

          <GlassCard className="p-0 border-none ring-1 ring-(--glass-border) shadow-xl shadow-black/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[560px]">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-(--glass-border)">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-40 italic">Nom / Type</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-40 italic hidden md:table-cell whitespace-nowrap">Propriétaire</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-40 italic hidden md:table-cell whitespace-nowrap">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-40 italic text-right whitespace-nowrap w-px">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--glass-border)">
                  {activeLoading ? (
                    <tr>
                      <td colSpan={3} className="text-center py-16">
                        <div className="flex flex-col items-center gap-4 opacity-40">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <p className="text-xs font-black uppercase tracking-widest italic">Chargement...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-16 opacity-40">
                        <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm font-black italic uppercase tracking-widest">Aucun document trouvé.</p>
                      </td>
                    </tr>
                  ) : filteredDocs.map((doc, i) => (
                      <motion.tr key={doc.id || i}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="group hover:bg-primary/2 transition-colors"
                      >
                        {/* Name column — flex min-w-0 so it shrinks instead of overflowing */}
                        <td className="px-6 py-4 max-w-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-base group-hover:scale-105 transition-transform shrink-0">
                              {DOC_TYPE_ICONS[doc.documentType] || '📁'}
                            </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-bold truncate">
                              {doc.title || doc.fileName || doc.name || `Doc #${doc.id}`}
                            </p>
                            <p className="text-[10px] font-bold opacity-40 uppercase">{doc.documentType}</p>
                          </div>
                        </div>
                      </td>
                      {/* Owner column */}
                      <td className="px-6 py-4 hidden md:table-cell whitespace-nowrap">
                        {doc.owner ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                              {doc.owner.photoUrl ? (
                                <img src={doc.owner.photoUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[10px] font-bold text-primary">
                                  {doc.owner.firstName[0]}{doc.owner.lastName[0]}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-bold opacity-70">
                              {doc.owner.firstName} {doc.owner.lastName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] italic opacity-30">Inconnu</span>
                        )}
                      </td>
                      {/* Date column */}
                      <td className="px-6 py-4 hidden md:table-cell whitespace-nowrap">
                        <span className="text-xs italic opacity-60">{formatDateFr(doc.createdAt || doc.uploadedAt)}</span>
                        {doc.version && (
                          <span className="ml-2 text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full opacity-60">
                            v{doc.version}
                          </span>
                        )}
                      </td>
                      {/* Actions column — never wraps, conditional confirm replaces icon buttons */}
                      <td className="px-4 py-4 text-right w-px whitespace-nowrap">
                        {canManage && deleteConfirm === doc.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => deleteMutation.mutate(doc.id)}
                              disabled={deleteMutation.isPending}
                              className="px-3 py-1.5 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1"
                            >
                              {deleteMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirmer'}
                            </button>
                            <button onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase tracking-widest rounded-lg">
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            {/* View */}
                            <button
                              onClick={() => setViewerDoc(doc)}
                              className="p-2 rounded-xl hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-500 transition-all active:scale-90"
                              title="Aperçu"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  const version = await documentsService.getDocumentVersion(doc.id, ownerId)
                                  window.open(documentsService.getFileUrl(version.filePath), '_blank')
                                } catch { toast.error('Impossible de télécharger le document.') }
                              }}
                              className="p-2 rounded-xl hover:bg-primary/10 text-primary transition-all active:scale-90" title="Télécharger">
                              <Download className="w-4 h-4" />
                            </button>
                            <button onClick={() => { setVersionDocId(doc.id); setShowVersionUpload(false) }}
                              className="p-2 rounded-xl hover:bg-indigo-500/10 text-indigo-400 hover:text-indigo-500 transition-all active:scale-90" title="Historique des versions">
                              <History className="w-4 h-4" />
                            </button>
                            {canManage && (
                              <button onClick={() => setAuditDocId(doc.id)}
                                className="p-2 rounded-xl hover:bg-amber-500/10 text-amber-400 hover:text-amber-500 transition-all active:scale-90" title="Journal d'audit">
                                <ShieldCheck className="w-4 h-4" />
                              </button>
                            )}
                            {canManage && (
                              <button onClick={() => setDeleteConfirm(doc.id)}
                                className="p-2 rounded-xl hover:bg-rose-500/10 text-rose-400 hover:text-rose-500 transition-all active:scale-90" title="Supprimer">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <GlassCard title="Répartition" className="border-none ring-1 ring-(--glass-border) shadow-xl shadow-black/5">
            <div className="pt-4 space-y-3">
              {DOC_TYPES.map(t => {
                const count = activeDocs.filter(d => d.documentType === t.id).length
                const pct   = activeDocs.length > 0 ? Math.round(count / activeDocs.length * 100) : 0
                return (
                  <div key={t.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="opacity-60 flex items-center gap-2">{t.icon} {t.label}</span>
                      <span>{count}</span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        className="h-full rounded-full bg-primary/60"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </GlassCard>

          {/* Student: PDF transcript card */}
          {isStudent && (
            <div className="premium-gradient p-8 rounded-3xl text-white relative overflow-hidden group cursor-pointer shadow-2xl shadow-primary/30">
              <FileText className="w-12 h-12 mb-4 opacity-50 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-black italic">Relevé de Notes PDF</h3>
              <p className="text-sm opacity-80 mt-2 font-medium">Téléchargez votre relevé officiel signé.</p>
              <a href={`/api/v1/pdf/transcripts/${ownerId}`} target="_blank"
                className="mt-6 px-5 py-2.5 bg-white text-primary rounded-xl font-black text-xs uppercase tracking-widest shadow-lg inline-block hover:bg-white/90 transition-colors">
                Télécharger
              </a>
              <div className="absolute right-[-10px] bottom-[-10px] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>
          )}

          {/* Admin quick nav to reference */}
          {canManage && adminTab !== 'reference' && (
            <GlassCard className="border-none ring-1 ring-(--glass-border) p-6">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-4 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" /> Accès Rapide
              </h3>
              <p className="text-[11px] opacity-60 font-medium mb-4">
                Consultez les documents liés à un étudiant, un professeur ou une autre entité.
              </p>
              <button
                onClick={() => setAdminTab('reference')}
                className="w-full py-2.5 rounded-xl bg-primary/10 text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/20 transition-colors"
              >
                Recherche par entité →
              </button>
            </GlassCard>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          UPLOAD MODAL
      ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) closeUpload() }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-black italic tracking-tight">Uploader un Document</h3>
                <button onClick={closeUpload} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* File preview */}
                {uploadFile && (
                  <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/20">
                    <span className="text-2xl">{DOC_TYPE_ICONS[uploadForm.documentType]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{uploadFile.name}</p>
                      <p className="text-[10px] opacity-50">{(uploadFile.size / 1024).toFixed(1)} Ko</p>
                    </div>
                    <button onClick={closeUpload} className="p-1 hover:bg-rose-500/10 rounded-lg text-rose-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Type */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Type de document *</label>
                  <select value={uploadForm.documentType}
                    onChange={e => setUploadForm(p => ({ ...p, documentType: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900/80 ring-1 ring-(--glass-border) rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-primary/50">
                    {DOC_TYPES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Titre</label>
                  <input type="text" placeholder="Ex : Diplôme de Bachelor 2024"
                    value={uploadForm.title}
                    onChange={e => setUploadForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900/80 ring-1 ring-(--glass-border) rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-primary/50" />
                </div>

                {/* Submit */}
                <button
                  onClick={() => uploadMutation.mutate()}
                  disabled={!uploadFile || uploadMutation.isPending}
                  className="w-full py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Confirmer l'upload
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════
          VERSION HISTORY MODAL
      ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {versionDocId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) { setVersionDocId(null); setShowVersionUpload(false) } }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex justify-between items-start mb-5 shrink-0">
                <div>
                  <h3 className="text-xl font-black italic tracking-tight">Historique des Versions</h3>
                  <p className="text-[11px] opacity-50 font-medium mt-1">Document #{versionDocId}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowVersionUpload(v => !v)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Nouvelle version
                  </button>
                  <button
                    onClick={() => { setVersionDocId(null); setShowVersionUpload(false) }}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Inline version upload */}
              <AnimatePresence>
                {showVersionUpload && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="mb-5 overflow-hidden shrink-0"
                  >
                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex items-center gap-4">
                      <input ref={versionFileRef} type="file" className="hidden" accept=".pdf,.docx,.jpg,.jpeg,.png"
                        onChange={e => {
                          const f = e.target.files?.[0]
                          if (f) uploadVersionMutation.mutate({ docId: versionDocId, file: f })
                          e.target.value = ''
                        }} />
                      <button
                        onClick={() => versionFileRef.current?.click()}
                        disabled={uploadVersionMutation.isPending}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50 shrink-0"
                      >
                        {uploadVersionMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        Choisir un fichier
                      </button>
                      <p className="text-[11px] opacity-50 font-medium">Sélectionnez le fichier de la nouvelle version.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Versions list */}
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {loadingVersions ? (
                  <div className="flex flex-col items-center py-12 gap-4 opacity-40">
                    <Loader2 className="w-7 h-7 animate-spin text-primary" />
                    <p className="text-xs font-black uppercase tracking-widest italic">Chargement...</p>
                  </div>
                ) : versions.length === 0 ? (
                  <div className="py-12 text-center opacity-40">
                    <History className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-black italic uppercase">Aucune version disponible.</p>
                    <p className="text-[11px] mt-2 font-medium">Uploadez une nouvelle version avec le bouton ci-dessus.</p>
                  </div>
                ) : versions.map((v, i) => (
                  <div key={v.id || i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-[11px] font-black">
                        v{v.version || (versions.length - i)}
                      </div>
                      <div>
                        <p className="text-xs font-bold">{v.fileName || v.name || `Version ${i + 1}`}</p>
                        <p className="text-[10px] opacity-40">{formatDateFr(v.createdAt)}</p>
                      </div>
                    </div>
                    <a
                      href={v.filePath ? documentsService.getFileUrl(v.filePath) : '#'}
                      target="_blank"
                      className="p-2 rounded-xl hover:bg-primary/10 text-primary transition-all active:scale-90">
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════
          AUDIT MODAL (admin / manager only)
      ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {auditDocId && canManage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setAuditDocId(null) }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex justify-between items-start mb-6 shrink-0">
                <div>
                  <h3 className="text-xl font-black italic tracking-tight flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-500" /> Journal d'Audit
                  </h3>
                  <p className="text-[11px] opacity-50 font-medium mt-1">Document #{auditDocId} — Accès et modifications</p>
                </div>
                <button onClick={() => setAuditDocId(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {loadingAudit ? (
                  <div className="flex flex-col items-center py-12 gap-4 opacity-40">
                    <Loader2 className="w-7 h-7 animate-spin text-primary" />
                    <p className="text-xs font-black uppercase tracking-widest italic">Chargement du journal...</p>
                  </div>
                ) : auditLog.length === 0 ? (
                  <div className="py-12 text-center opacity-40">
                    <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-black italic uppercase">Aucun événement enregistré.</p>
                  </div>
                ) : auditLog.map((entry, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                    <div className={cn('w-2 h-2 rounded-full mt-2 shrink-0', AUDIT_COLORS[entry.action] || 'bg-slate-400')} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest">{entry.action}</span>
                        <span className="text-[10px] opacity-40 shrink-0">{formatDateFr(entry.createdAt || entry.accessedAt || entry.timestamp)}</span>
                      </div>
                      {entry.user ? (
                        <p className="text-[11px] opacity-60 mt-0.5 font-bold">
                          Par : {entry.user.firstName} {entry.user.lastName} <span className="opacity-40 text-[9px] uppercase tracking-tighter">({entry.user.role})</span>
                        </p>
                      ) : entry.performedBy ? (
                        <p className="text-[11px] opacity-60 mt-0.5">Par : {entry.performedBy}</p>
                      ) : null}
                      {entry.ipAddress  && <p className="text-[10px] opacity-40 font-mono">IP : {entry.ipAddress}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>

    {/* Document Viewer — full-screen overlay */}
    <DocumentViewer doc={viewerDoc} userId={ownerId} onClose={() => setViewerDoc(null)} />
    </>
  )
}
