'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Download, ZoomIn, ZoomOut, RotateCw, Maximize2,
  FileText, FileSpreadsheet, FileCode, File, Loader2,
  AlertTriangle, ChevronLeft, ChevronRight
} from 'lucide-react'
import { documentsService } from '@/lib/documents-service'
import { cn } from '@/lib/utils'

// ── File type detection ──────────────────────────────────────────────────────
const EXT_MAP = {
  pdf:  'pdf',
  jpg:  'image', jpeg: 'image', png: 'image',
  gif:  'image', webp: 'image', svg: 'image', bmp: 'image',
  doc:  'word',  docx: 'word',
  xls:  'excel', xlsx: 'excel', csv: 'csv',
  txt:  'text',  md:   'text',
  mp4:  'video', webm: 'video', mov: 'video',
  mp3:  'audio', wav:  'audio', ogg: 'audio',
}

function detectType(fileName, mimeType) {
  const ext = (fileName || '').split('.').pop().toLowerCase()
  if (EXT_MAP[ext]) return EXT_MAP[ext]
  if (mimeType?.includes('pdf'))   return 'pdf'
  if (mimeType?.startsWith('image/')) return 'image'
  if (mimeType?.startsWith('video/')) return 'video'
  if (mimeType?.startsWith('audio/')) return 'audio'
  if (mimeType?.includes('word') || mimeType?.includes('document')) return 'word'
  if (mimeType?.includes('sheet') || mimeType?.includes('excel'))   return 'excel'
  if (mimeType?.startsWith('text/')) return 'text'
  return 'unknown'
}

const TYPE_META = {
  pdf:     { label: 'PDF',         icon: FileText,        color: 'text-rose-500',   bg: 'bg-rose-50 dark:bg-rose-950/30' },
  image:   { label: 'Image',       icon: File,            color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
  word:    { label: 'Word',        icon: FileText,        color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950/30' },
  excel:   { label: 'Excel',       icon: FileSpreadsheet, color: 'text-emerald-500',bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  csv:     { label: 'CSV',         icon: FileSpreadsheet, color: 'text-emerald-500',bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  text:    { label: 'Texte',       icon: FileCode,        color: 'text-slate-500',  bg: 'bg-slate-50 dark:bg-slate-900' },
  video:   { label: 'Vidéo',       icon: File,            color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  audio:   { label: 'Audio',       icon: File,            color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-950/30' },
  unknown: { label: 'Fichier',     icon: File,            color: 'text-slate-400',  bg: 'bg-slate-50 dark:bg-slate-900' },
}

// ── Main Component ───────────────────────────────────────────────────────────
export function DocumentViewer({ doc, onClose, userId }) {
  const [blobUrl,  setBlobUrl]  = useState(null)
  const [fileUrl,  setFileUrl]  = useState(null)   // direct public URL for download fallback
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [textContent, setTextContent] = useState('')
  const [docVersion, setDocVersion] = useState(null)

  // Image controls
  const [zoom,    setZoom]    = useState(1)
  const [rotate,  setRotate]  = useState(0)

  const fileType = detectType(
    docVersion?.fileName || doc?.fileName || doc?.name,
    docVersion?.mimeType || doc?.mimeType || doc?.contentType,
  )
  const meta     = TYPE_META[fileType] || TYPE_META.unknown
  const fileName = doc?.title || docVersion?.fileName || doc?.fileName || doc?.name || `Document #${doc?.id}`

  // ── Load blob ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!doc?.id) return
    let objectUrl = null
    setLoading(true)
    setError(null)
    setBlobUrl(null)
    setFileUrl(null)
    setDocVersion(null)
    setZoom(1)
    setRotate(0)
    setTextContent('')

    documentsService.getDownloadBlob(doc.id, userId)
      .then(async ({ blob, version, fileUrl: fu }) => {
        setDocVersion(version)
        setFileUrl(fu)
        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)

        // For text files, also read the content
        const ft = detectType(version?.fileName || doc?.fileName, version?.mimeType || doc?.mimeType)
        if (ft === 'text' || ft === 'csv') {
          const text = await blob.text()
          setTextContent(text)
        }
      })
      .catch(err => {
        setError(err.message || 'Impossible de charger le document.')
      })
      .finally(() => setLoading(false))

    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [doc?.id])

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (fileType === 'image') {
        if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z + 0.25, 4))
        if (e.key === '-') setZoom(z => Math.max(z - 0.25, 0.25))
        if (e.key === 'r') setRotate(r => (r + 90) % 360)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [fileType, onClose])

  const handleDownload = useCallback(() => {
    if (!blobUrl) return
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = fileName
    a.click()
  }, [blobUrl, fileName])

  // ── Render content ─────────────────────────────────────────────────────────
  const renderContent = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-white/60">
        <Loader2 className="w-12 h-12 animate-spin text-white/40" />
        <p className="text-sm font-black uppercase tracking-widest italic">Chargement du document...</p>
      </div>
    )

    if (error) return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-white/60">
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20">
          <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-center text-rose-300">{error}</p>
        </div>
        {fileUrl && (
          <a href={fileUrl} target="_blank"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-white/90 transition-colors">
            <Download className="w-4 h-4" /> Télécharger à la place
          </a>
        )}
      </div>
    )

    switch (fileType) {
      // ── PDF ────────────────────────────────────────────────────────────────
      case 'pdf':
        return (
          <iframe
            src={blobUrl}
            className="w-full h-full border-0 rounded-none"
            title={fileName}
          />
        )

      // ── Image ──────────────────────────────────────────────────────────────
      case 'image':
        return (
          <div className="flex items-center justify-center h-full overflow-auto p-6 select-none">
            <img
              src={blobUrl}
              alt={fileName}
              style={{
                transform: `scale(${zoom}) rotate(${rotate}deg)`,
                transition: 'transform 0.2s ease',
                maxWidth: zoom === 1 ? '100%' : 'none',
                maxHeight: zoom === 1 ? '100%' : 'none',
              }}
              className="rounded-xl shadow-2xl object-contain cursor-zoom-in"
              onClick={() => setZoom(z => z < 2 ? z + 0.5 : 1)}
              draggable={false}
            />
          </div>
        )

      // ── Video ──────────────────────────────────────────────────────────────
      case 'video':
        return (
          <div className="flex items-center justify-center h-full p-6">
            <video
              src={blobUrl}
              controls
              className="max-w-full max-h-full rounded-2xl shadow-2xl"
              style={{ maxHeight: 'calc(100vh - 140px)' }}
            >
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          </div>
        )

      // ── Audio ──────────────────────────────────────────────────────────────
      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center h-full gap-8">
            <div className="p-12 rounded-3xl bg-white/5 border border-white/10">
              <div className={cn('w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6', meta.bg)}>
                <meta.icon className={cn('w-12 h-12', meta.color)} />
              </div>
              <p className="text-white/60 text-sm font-bold text-center mb-6">{fileName}</p>
              <audio src={blobUrl} controls className="w-full min-w-[320px]">
                Votre navigateur ne supporte pas l'audio.
              </audio>
            </div>
          </div>
        )

      // ── Text / CSV ─────────────────────────────────────────────────────────
      case 'text':
      case 'csv':
        return (
          <div className="h-full overflow-auto p-6">
            <pre className="text-sm text-slate-200 font-mono leading-relaxed whitespace-pre-wrap break-words
              bg-black/30 rounded-2xl p-6 min-h-full">
              {textContent || '(fichier vide)'}
            </pre>
          </div>
        )

      // ── Word / Excel / Unknown ─────────────────────────────────────────────
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full gap-8">
            <div className="p-12 rounded-3xl bg-white/5 border border-white/10 text-center max-w-md">
              <div className={cn('w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6', meta.bg)}>
                <meta.icon className={cn('w-12 h-12', meta.color)} />
              </div>
              <p className="text-white font-black text-xl italic mb-2">{meta.label}</p>
              <p className="text-white/50 text-sm font-medium mb-2 truncate max-w-xs mx-auto">{fileName}</p>
              <p className="text-white/30 text-xs mb-8 font-medium">
                L'aperçu en ligne n'est pas disponible pour ce type de fichier.
              </p>
              <button
                onClick={handleDownload}
                disabled={!blobUrl}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-widest shadow-xl hover:bg-white/90 transition-colors mx-auto disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                Télécharger pour ouvrir
              </button>
            </div>
          </div>
        )
    }
  }

  return (
    <AnimatePresence>
      {doc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex flex-col bg-[#0d1117]"
        >
          {/* ── Top bar ────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-xl border-b border-white/10 shrink-0 gap-4">
            {/* Left: file info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm', meta.bg)}>
                <meta.icon className={cn('w-4 h-4', meta.color)} />
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-bold truncate max-w-[300px] md:max-w-[500px]">{fileName}</p>
                <p className={cn('text-[10px] font-black uppercase tracking-widest', meta.color)}>{meta.label}</p>
              </div>
            </div>

            {/* Center: image controls */}
            {fileType === 'image' && !loading && !error && (
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                <button
                  onClick={() => setZoom(z => Math.max(z - 0.25, 0.25))}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  title="Zoom arrière (−)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-white/60 text-[11px] font-black w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(z => Math.min(z + 0.25, 4))}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  title="Zoom avant (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-white/10 mx-1" />
                <button
                  onClick={() => setRotate(r => (r + 90) % 360)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  title="Rotation (R)"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  title="Réinitialiser"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Right: actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleDownload}
                disabled={!blobUrl}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-black uppercase tracking-widest transition-colors disabled:opacity-30"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Télécharger</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="Fermer (Échap)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── Content area ───────────────────────────────────────────────── */}
          <div className="flex-1 min-h-0 overflow-hidden relative">
            {renderContent()}
          </div>

          {/* ── Bottom bar: keyboard hints ─────────────────────────────────── */}
          {fileType === 'image' && !loading && !error && (
            <div className="shrink-0 flex items-center justify-center gap-6 py-2 bg-black/40 border-t border-white/5">
              {[
                { key: 'Clic', action: 'Zoom ×2' },
                { key: '+/−', action: 'Zoom' },
                { key: 'R', action: 'Rotation' },
                { key: 'Échap', action: 'Fermer' },
              ].map(h => (
                <div key={h.key} className="flex items-center gap-1.5 text-white/30">
                  <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-black font-mono">{h.key}</kbd>
                  <span className="text-[10px] font-medium">{h.action}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
