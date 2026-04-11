import {
  LayoutDashboard,
  Users,
  UserPlus,
  GraduationCap,
  BookOpen,
  Calendar,
  CreditCard,
  FolderOpen,
  MessageSquare,
  Trophy,
  Briefcase,
  PieChart,
  FileText,
  UserCheck,
  ClipboardList,
  Layers,
  Activity,
  LayoutGrid,
  Terminal,
  Award
} from 'lucide-react'

export const NAVIGATION = [
  {
    name: 'Dashboard',
    href: '/overview',
    icon: LayoutDashboard,
    roles: ['ALL']
  },
  {
    label: 'GOUVERNANCE',
    type: 'section',
    roles: ['ADMIN', 'SCHOOL_MANAGER', 'PEDAGOGICAL_MANAGER', 'SUPPORT']
  },
  {
    name: 'Utilisateurs',
    href: '/users',
    icon: Users,
    roles: ['ADMIN', 'SUPER_ADMIN', 'SCHOOL_MANAGER', 'SUPPORT']
  },
  {
    name: 'Structure Académique',
    href: '/academic',
    icon: Layers,
    roles: ['ADMIN', 'SCHOOL_MANAGER', 'PEDAGOGICAL_MANAGER'],
    resource: 'academic',
    action: 'read'
  },
  {
    name: 'Catalogue (LMS)',
    href: '/lms',
    icon: LayoutGrid,
    roles: ['ADMIN', 'SCHOOL_MANAGER', 'PEDAGOGICAL_MANAGER', 'TEACHER'],
    resource: 'lms',
    action: 'read'
  },
  {
    name: 'Étudiants & Admissions',
    href: '/students',
    icon: UserPlus,
    roles: ['ADMIN', 'SCHOOL_MANAGER', 'PEDAGOGICAL_MANAGER'],
    resource: 'students',
    action: 'read'
  },
  {
    name: 'Corps Enseignant',
    href: '/teachers',
    icon: GraduationCap,
    roles: ['ADMIN', 'SCHOOL_MANAGER', 'PEDAGOGICAL_MANAGER'],
    resource: 'teachers',
    action: 'read'
  },
  {
    label: 'ACADÉMIQUE',
    type: 'section',
    roles: ['STUDENT', 'TEACHER', 'PEDAGOGICAL_MANAGER']
  },
  {
    name: 'Mes Cours',
    href: '/courses',
    icon: BookOpen,
    roles: ['STUDENT', 'TEACHER'],
    resource: 'courses',
    action: 'read'
  },
  {
    name: 'Agenda & Sessions',
    href: '/agenda',
    icon: Calendar,
    roles: ['STUDENT', 'TEACHER', 'PEDAGOGICAL_MANAGER'],
    resource: 'agenda',
    action: 'read'
  },
  {
    name: 'Évaluations & Examens',
    href: '/exams',
    icon: ClipboardList,
    roles: ['TEACHER', 'STUDENT', 'PEDAGOGICAL_MANAGER'],
    resource: 'exams',
    action: 'read'
  },
  {
    name: 'Présences & Notes',
    href: '/records',
    icon: FileText,
    roles: ['TEACHER', 'STUDENT', 'PEDAGOGICAL_MANAGER'],
    resource: 'records',
    action: 'read'
  },
  {
    label: 'ADMINISTRATION',
    type: 'section',
    roles: ['ALL']
  },
  {
    name: 'Finance & Paiements',
    href: '/finance',
    icon: CreditCard,
    roles: ['ADMIN', 'FINANCE_MANAGER', 'SCHOOL_MANAGER', 'STUDENT'],
    resource: 'finance',
    action: 'read'
  },
  {
    name: 'Documents (GED)',
    href: '/documents',
    icon: FolderOpen,
    roles: ['ALL'],
    resource: 'documents',
    action: 'read'
  },
  {
    name: 'Messagerie',
    href: '/communications',
    icon: MessageSquare,
    roles: ['ALL'],
    resource: 'messages',
    action: 'read'
  },
  {
    label: 'DÉVELOPPEMENT',
    type: 'section',
    roles: ['ADMIN', 'STUDENT', 'MENTOR', 'SCHOOL_MANAGER']
  },
  {
    name: 'Mentorat',
    href: '/mentoring',
    icon: UserCheck,
    roles: ['MENTOR', 'STUDENT', 'ADMIN', 'SCHOOL_MANAGER'],
    resource: 'mentoring',
    action: 'read'
  },
  {
    name: 'Carrière',
    href: '/career',
    icon: Briefcase,
    roles: ['STUDENT', 'ADMIN', 'SCHOOL_MANAGER'],
    resource: 'career',
    action: 'read'
  },
  {
    name: 'Compétences & Badges',
    href: '/competences',
    icon: Award,
    roles: ['ALL'],
    resource: 'competences',
    action: 'read'
  },
  {
    name: 'Analytics & IA',
    href: '/analytics',
    icon: Activity,
    roles: ['ADMIN', 'SCHOOL_MANAGER', 'SUPPORT'],
    resource: 'analytics',
    action: 'read'
  },
  {
    name: 'Logs Système',
    href: '/logs',
    icon: Terminal,
    roles: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'],
    resource: 'logs',
    action: 'read'
  }
]
