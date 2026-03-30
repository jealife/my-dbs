# Suivi du Projet Front-end (Pour Trello)

Ce document répertorie l'état actuel des interfaces construites sur le projet MyDBS, afin de faciliter l'intégration et le suivi sur vos cartes Trello.

## 🎨 Interfaces Front-end DÉJÀ CONÇUES (UI/UX Implémentées)

Toutes les interfaces de la navigation principale ont leur vue initiale (UI riche avec design system, animations, cartes, listes) fonctionnelle.

- [x] **Système de base**
  - [x] Portail Login (Auth)
  - [x] Sidebar dynamique (gérée selon le RBAC - Role Based Access Control)
  - [x] Fallback / Overviews de Dashboard (Admin, Student, Teacher, Finance, etc.)
- [x] **Gouvernance & Administration**
  - [x] Structure Académique
  - [x] Catalogue des Cours (LMS)
  - [x] Étudiants & Admissions
  - [x] Corps Enseignant
- [x] **Académique**
  - [x] Mes Cours
  - [x] Agenda & Sessions
  - [x] Évaluations & Examens
  - [x] Présences & Notes
- [x] **Opérations & Support**
  - [x] Finance & Paiements
  - [x] Documents (GED)
  - [x] Messagerie (Communications)
- [x] **Développement**
  - [x] Mentorat
  - [x] Carrière
  - [x] Analytics & IA
- [x] **Divers**
  - [x] Profil Utilisateur
  - [x] Paramètres globaux

---

## 🚧 Interfaces MANQUANTES (À créer ou finaliser en UI)

Bien que les pages principales soient là, certains sous-écrans et actions nécessitent encore du design / intégration :

- [ ] Vues Détaillées Individuelles (ex: `app/students/[id]` pour le dossier complet d'un étudiant ou le détail complet d'un module de cours).
- [ ] Composants d'Édition (Les modales pour *éditer/modifier* un étudiant, un prof ou un cours sont sous alertes "en construction 🚧").
- [ ] Dropdown & Interface des Notifications de la Navbar.
- [ ] Interfaces des Formulaires Complexes (Création d'un emploi du temps, Saisie multiple des notes, Upload en drag & drop).
- [ ] Modales de confirmation de suppression pour tous les modules.

---

## 🔗 Interfaces DÉJÀ CONNECTÉES aux modules Back-end

Ces interfaces fetch leurs données depuis la vraie base de données (Supabase / Backend) via React Query ou autres services :

- [x] **Authentification & Session** (Validation du login, récupération du rôle de l'utilisateur).
- [x] **Module Étudiants** (Récupération de la liste réelle, création d'étudiants avec auth intégrée).
- [x] **Module Corps Enseignant** (Récupération des profs réels, création de comptes profs).
- [x] **Structure Académique** (Niveaux, Types, Sections).

---

## 🔌 Interfaces À CONNECTER au Back-end (Utilisent encore des fausses données / Mock)

Ces interfaces ont un très beau visuel mais nécessitent qu'on branche leurs variables aux APIs correspondantes :

- [ ] Catalogue (LMS) et Mes Cours (actuellement données "en dur").
- [ ] Agenda & Sessions
- [ ] Évaluations, Examens, Présences & Notes
- [ ] Finance & Paiements
- [ ] Documents (GED)
- [ ] Messagerie / Communications
- [ ] Mentorat & Carrière
- [ ] Analytics & IA (les stats affichées sont statiques)
- [ ] Mises à jour du profil utilisateur
