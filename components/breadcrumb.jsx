'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { motion } from 'framer-motion'

// ─── Route label map ──────────────────────────────────────────────────────────
// Segment → label affiché. Les segments dynamiques ([id]) sont résolus séparément.

const ROUTE_LABELS = {
  overview:       'Tableau de bord',
  users:          'Utilisateurs',
  academic:       'Structure Académique',
  lms:            'Catalogue (LMS)',
  students:       'Étudiants',
  teachers:       'Corps Enseignant',
  courses:        'Cours',
  agenda:         'Agenda & Sessions',
  exams:          'Évaluations & Examens',
  records:        'Présences & Notes',
  finance:        'Finance & Paiements',
  documents:      'Documents (GED)',
  communications: 'Messagerie',
  competences:    'Compétences & Badges',
  mentoring:      'Mentorat',
  career:         'Carrière',
  analytics:      'Analytics & IA',
  logs:           'Logs Système',
  profile:        'Mon Profil',
  settings:       'Paramètres',
  scolarity:      'Scolarité',
  admissions:     'Admissions',
}

// Labels pour les segments dynamiques selon le contexte parent
const DYNAMIC_LABELS = {
  students:   'Fiche Étudiant',
  teachers:   'Fiche Enseignant',
  courses:    'Détail du cours',
  admissions: 'Dossier de candidature',
}

// Segments à masquer dans le fil d'Ariane (overview = home, pas besoin de répéter)
const HIDDEN_SEGMENTS = new Set(['overview'])

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isId(segment) {
  // Numérique pur, UUID, ou code alphanumérique court
  return /^\d+$/.test(segment) || /^[0-9a-f-]{8,}$/i.test(segment)
}

function buildCrumbs(pathname) {
  // Normalise : retire leading slash, split
  const parts = pathname.replace(/^\//, '').split('/').filter(Boolean)

  if (parts.length === 0 || (parts.length === 1 && HIDDEN_SEGMENTS.has(parts[0]))) {
    return [] // Pas de breadcrumb sur le dashboard racine
  }

  const crumbs = []
  let accumulated = ''

  // Home toujours en premier
  crumbs.push({ label: 'Accueil', href: '/overview', isHome: true })

  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i]
    accumulated += `/${seg}`

    if (HIDDEN_SEGMENTS.has(seg)) continue

    // Segment dynamique (id) → label contextuel selon le parent
    if (isId(seg)) {
      const parent = parts[i - 1]
      const label = DYNAMIC_LABELS[parent] || 'Détail'
      crumbs.push({
        label,
        href: accumulated,
        isDynamic: true,
        isLast: i === parts.length - 1,
      })
      continue
    }

    const label = ROUTE_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1)
    crumbs.push({
      label,
      href: accumulated,
      isLast: i === parts.length - 1,
    })
  }

  return crumbs
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Breadcrumb() {
  const pathname = usePathname()
  const crumbs = buildCrumbs(pathname)

  // N'affiche rien si un seul segment (home seul) ou aucun
  if (crumbs.length <= 1) return null

  return (
    <motion.nav
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-label="Fil d'Ariane"
      className="flex items-center gap-1 mb-6 flex-wrap"
    >
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {/* Séparateur (pas avant le premier élément) */}
          {i > 0 && (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-40 shrink-0" />
          )}

          {crumb.isLast ? (
            // Dernier segment : non cliquable, mis en valeur
            <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-foreground">
              {crumb.isHome && <Home className="w-3.5 h-3.5 shrink-0" />}
              {crumb.label}
            </span>
          ) : (
            // Segments précédents : liens cliquables
            <Link
              href={crumb.href}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors opacity-60 hover:opacity-100"
            >
              {crumb.isHome && <Home className="w-3.5 h-3.5 shrink-0" />}
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </motion.nav>
  )
}
