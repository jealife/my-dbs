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
  LayoutGrid
} from 'lucide-react'

export const NAVIGATION = [
  {
    name: 'Dashboard',
    href: '/overview',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'STUDENT', 'TEACHER', 'FINANCE', 'DIRECTION', 'MENTOR', 'SCOLARITY']
  },
  {
    label: 'GOUVERNANCE',
    type: 'section',
    roles: ['ADMIN', 'DIRECTION', 'SCOLARITY']
  },
  {
    name: 'Structure Académique',
    href: '/academic',
    icon: Layers,
    roles: ['ADMIN', 'DIRECTION', 'SCOLARITY'],
    resource: 'academic',
    action: 'read'
  },
  {
    name: 'Catalogue (LMS)',
    href: '/lms',
    icon: LayoutGrid,
    roles: ['ADMIN', 'DIRECTION', 'SCOLARITY'],
    resource: 'lms',
    action: 'read'
  },
  {
    name: 'Étudiants & Admissions',
    href: '/students',
    icon: UserPlus,
    roles: ['ADMIN', 'DIRECTION', 'SCOLARITY'],
    resource: 'students',
    action: 'read'
  },
  {
    name: 'Corps Enseignant',
    href: '/teachers',
    icon: Users,
    roles: ['ADMIN', 'DIRECTION', 'SCOLARITY'],
    resource: 'teachers',
    action: 'read'
  },
  {
    label: 'ACADÉMIQUE',
    type: 'section',
    roles: ['STUDENT', 'TEACHER', 'SCOLARITY']
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
    roles: ['STUDENT', 'TEACHER', 'SCOLARITY'],
    resource: 'agenda',
    action: 'read'
  },
  {
    name: 'Évaluations & Examens',
    href: '/exams',
    icon: ClipboardList,
    roles: ['TEACHER', 'STUDENT', 'SCOLARITY'],
    resource: 'exams',
    action: 'read'
  },
  {
    name: 'Présences & Notes',
    href: '/records',
    icon: FileText,
    roles: ['TEACHER', 'STUDENT', 'SCOLARITY'],
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
    roles: ['ADMIN', 'FINANCE', 'DIRECTION', 'STUDENT'],
    resource: 'finance',
    action: 'read'
  },
  {
    name: 'Documents (GED)',
    href: '/documents',
    icon: FolderOpen,
    roles: ['ADMIN', 'STUDENT', 'TEACHER', 'FINANCE', 'DIRECTION', 'MENTOR', 'SCOLARITY'],
    resource: 'documents',
    action: 'read'
  },
  {
    name: 'Messagerie',
    href: '/communications',
    icon: MessageSquare,
    roles: ['ADMIN', 'STUDENT', 'TEACHER', 'FINANCE', 'DIRECTION', 'MENTOR', 'SCOLARITY'],
    resource: 'messages',
    action: 'read'
  },
  {
    label: 'DÉVELOPPEMENT',
    type: 'section',
    roles: ['ADMIN', 'STUDENT', 'MENTOR', 'DIRECTION']
  },
  {
    name: 'Mentorat',
    href: '/mentoring',
    icon: UserCheck,
    roles: ['MENTOR', 'STUDENT', 'ADMIN'],
    resource: 'mentoring',
    action: 'read'
  },
  {
    name: 'Carrière',
    href: '/career',
    icon: Briefcase,
    roles: ['STUDENT', 'ADMIN'],
    resource: 'career',
    action: 'read'
  },
  {
    name: 'Analytics & IA',
    href: '/analytics',
    icon: Activity,
    roles: ['ADMIN', 'DIRECTION'],
    resource: 'analytics',
    action: 'read'
  },
]
