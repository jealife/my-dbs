# MyDBS Backend — Documentation Technique des API
**Version :** 1.0 | **Date :** Mars 2026 | **Stack :** Spring Boot 3.5 · Java 21 · MySQL 8 · Flyway

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Modules API](#2-modules-api)
   - [M01 Admissions](#m01--admissions-11-endpoints)
   - [M02 Évaluations](#m02--évaluations-20-endpoints)
   - [M03 Devoirs & Quiz](#m03--devoirs--quiz-18-endpoints)
   - [M04 Présences](#m04--présences-13-endpoints)
   - [M05 Notes & Bulletins](#m05--notes--bulletins-12-endpoints)
   - [M06 Finance](#m06--finance-15-endpoints)
   - [M07 GED / Documents](#m07--ged--documents-10-endpoints)
   - [M08 Communication](#m08--communication--notifications-15-endpoints)
   - [M09 Mentorat](#m09--mentorat-11-endpoints)
   - [M10 Carrière & Portfolio](#m10--carrière--portfolio-11-endpoints)
   - [M11 Analytics & IA](#m11--analytics--ia-10-endpoints)
   - [M12 Planning & Agenda](#m12--planning--agenda-8-endpoints)
   - [M13 Compétences & Badges](#m13--compétences--badges-10-endpoints)
   - [M14 SSE Notifications](#m14--sse-notifications-1-endpoint)
   - [M15 Export PDF](#m15--export-pdf-3-endpoints)
   - [M16 Batch Analytics](#m16--batch-analytics-0-endpoint)
   - [M17 Email Service](#m17--email-service-0-endpoint)
   - [M18 Tests](#m18--tests)
3. [Modèle de données](#3-modèle-de-données)
4. [Guide de démarrage rapide](#4-guide-de-démarrage-rapide)
5. [Annexes](#5-annexes)

---

## 1. Vue d'ensemble

### 1.1 Architecture technique

```
Frontend (React / Next.js)
         │
         │  HTTP + JWT
         ▼
┌─────────────────────────────────────────────────┐
│           Spring Boot 3.5 — Port 8080            │
│  ┌─────────────┬──────────────┬───────────────┐  │
│  │  Security   │  Controllers │   Schedulers   │  │
│  │  JWT Filter │  (@Rest)     │  (@Scheduled)  │  │
│  └──────┬──────┴──────┬───────┴───────────────┘  │
│         │             │                           │
│  ┌──────▼─────────────▼────────────────────────┐ │
│  │              Services (@Service)             │ │
│  └──────────────────────┬──────────────────────┘ │
│                         │                         │
│  ┌──────────────────────▼──────────────────────┐ │
│  │     Repositories (Spring Data JPA)           │ │
│  └──────────────────────┬──────────────────────┘ │
└─────────────────────────│───────────────────────┘
                          │ JDBC / Hibernate
                          ▼
                    MySQL 8.0
                   (Flyway V1_0_1 → V1_0_13)
```

**Composants transversaux :**
- `BaseAuditEntity` : `id`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `archived` (soft-delete)
- `ApiResponse<T>` : toutes les réponses JSON suivent `{ success, message, data, timestamp }`
- Soft-delete universel : aucune donnée n'est supprimée physiquement (champ `archived = true`)
- Pagination : paramètres `page`, `size`, `sort` disponibles sur tous les endpoints paginés

### 1.2 Conventions de code

| Convention | Valeur |
|---|---|
| Base URL | `http://localhost:8080/api/v1` |
| Format dates | ISO 8601 — `yyyy-MM-dd` / `yyyy-MM-ddTHH:mm:ss` |
| Format réponse | `ApiResponse<T>` pour JSON, `ResponseEntity<byte[]>` pour PDF |
| Pagination | `?page=0&size=20&sort=createdAt,desc` |
| IDs | `Long` (auto-incrémentés) |
| Soft-delete | Paramètre `archived=false` filtré automatiquement en service |
| Enums | Valeurs en SCREAMING_SNAKE_CASE (`DRAFT`, `PUBLISHED`, etc.) |

### 1.3 Sécurité et authentification

#### Authentification JWT

```
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "admin@mydbs.com", "password": "Admin@123456" }

→ Réponse : { "token": "eyJhbGci..." }
```

Tous les endpoints (sauf `/auth/**`) nécessitent le header :
```
Authorization: Bearer <token>
```

> **Durée de vie du token :** 24h (configurable via `jwt.expiration` en ms)

#### Rôles et permissions

| Rôle | Code Spring Security | Description |
|---|---|---|
| Super Administrateur | `SUPER_ADMIN` | Accès total sans restriction |
| Administrateur | `ADMIN` | Gestion générale |
| Gestionnaire scolaire | `SCHOOL_MANAGER` | Inscriptions, finance, scolarité |
| Responsable pédagogique | `PEDAGOGICAL_MANAGER` | Programmes, notes, bulletins |
| Enseignant | `TEACHER` | Cours, évaluations, devoirs, présences |
| Étudiant | `STUDENT` | Consultation de ses données |
| Candidat | `CANDIDATE` | Accès aux admissions uniquement |

> **Note :** Le rôle `SUPER_ADMIN` est inclus dans toutes les restrictions. Il est omis des tableaux ci-dessous par souci de concision mais est toujours autorisé.

#### Endpoints publics (sans authentification)

| Méthode | URL | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Connexion et obtention du JWT |
| `POST` | `/api/v1/auth/refresh` | Renouvellement du token |
| `GET` | `/api/v1/career/portfolio/showcase` | Vitrine publique des portfolios |
| `GET` | `/api/v1/communications/announcements` | Annonces publiques |

---

## 2. Modules API

---

### M01 — Admissions (11 endpoints)
**Base path :** `/api/v1/admissions`

**Workflow statuts :** `DRAFT → PENDING_REVIEW → UNDER_REVIEW → VALIDATED → ENROLLED` (ou `REJECTED`)

| # | Méthode | URL | Rôles | Description |
|---|---|---|---|---|
| 1 | `POST` | `/` | ADMIN, SCHOOL_MANAGER, CANDIDATE | Créer une candidature |
| 2 | `GET` | `/` | ADMIN, SCHOOL_MANAGER, PEDAGOGICAL_MANAGER | Lister (paginé, filtre `?status=`) |
| 3 | `GET` | `/{id}` | ADMIN, SCHOOL_MANAGER, PEDAGOGICAL_MANAGER, CANDIDATE | Détail candidature |
| 4 | `PUT` | `/{id}` | ADMIN, SCHOOL_MANAGER, CANDIDATE | Modifier (DRAFT uniquement) |
| 5 | `PATCH` | `/{id}/status` | ADMIN, SCHOOL_MANAGER, PEDAGOGICAL_MANAGER | Changer statut |
| 6 | `DELETE` | `/{id}` | ADMIN | Archiver (soft delete) |
| 7 | `POST` | `/{id}/documents` | ADMIN, SCHOOL_MANAGER, CANDIDATE | Upload pièce justificative |
| 8 | `GET` | `/{id}/documents` | ADMIN, SCHOOL_MANAGER, PEDAGOGICAL_MANAGER, CANDIDATE | Lister documents |
| 9 | `DELETE` | `/documents/{docId}` | ADMIN, SCHOOL_MANAGER | Supprimer document |
| 10 | `PATCH` | `/documents/{docId}/verify` | ADMIN, SCHOOL_MANAGER | Vérifier/invalider document |
| 11 | `POST` | `/{id}/notes` | ADMIN, SCHOOL_MANAGER, PEDAGOGICAL_MANAGER | Ajouter note interne |
| 12 | `GET` | `/{id}/notes` | ADMIN, SCHOOL_MANAGER, PEDAGOGICAL_MANAGER, CANDIDATE | Lister notes (`?includeInternal=false`) |

**Exemple — Créer une candidature :**
```bash
curl -X POST http://localhost:8080/api/v1/admissions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Marie",
    "lastName": "Dupont",
    "email": "marie.dupont@email.com",
    "programId": 1,
    "academicYearId": 2
  }'
```

**Exemple — Changer le statut :**
```bash
curl -X PATCH http://localhost:8080/api/v1/admissions/42/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "status": "VALIDATED", "reason": "Dossier complet" }'
```

---

### M02 — Évaluations (20 endpoints)
**Base path :** `/api/v1/evaluations`

**Workflow statuts :** `DRAFT → SCHEDULED → IN_PROGRESS → CLOSED → RESULTS_PUBLISHED`

| # | Méthode | URL | Rôles | Description |
|---|---|---|---|---|
| 1 | `POST` | `/` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Créer une évaluation |
| 2 | `GET` | `/` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER, STUDENT | Lister (`?status=&courseId=&cohortId=`) |
| 3 | `GET` | `/{id}` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER, STUDENT | Détail |
| 4 | `PUT` | `/{id}` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Modifier (DRAFT/SCHEDULED) |
| 5 | `PATCH` | `/{id}/status` | ADMIN, PEDAGOGICAL_MANAGER | Changer statut (`?targetStatus=`) |
| 6 | `DELETE` | `/{id}` | ADMIN | Archiver |
| 7 | `POST` | `/{id}/grades` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Saisir note étudiant |
| 8 | `GET` | `/{id}/grades` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Toutes les notes |
| 9 | `GET` | `/{id}/grades/student/{studentId}` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER, STUDENT | Note d'un étudiant |
| 10 | `PATCH` | `/grades/{resultId}` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Corriger note (avant publication) |
| 11 | `POST` | `/{id}/publish` | ADMIN, PEDAGOGICAL_MANAGER | Publier résultats |
| 12 | `GET` | `/my-results/student/{studentId}` | ADMIN, PEDAGOGICAL_MANAGER, STUDENT | Mes résultats publiés |
| 13 | `GET` | `/my-results/student/{studentId}/course/{courseId}` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER, STUDENT | Résultats par cours |
| 14 | `POST` | `/{id}/rubric` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Ajouter critère grille |
| 15 | `GET` | `/{id}/rubric` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER, STUDENT | Grille d'évaluation |
| 16 | `DELETE` | `/rubric/{criterionId}` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Supprimer critère |
| 17 | `POST` | `/deliberations` | ADMIN, PEDAGOGICAL_MANAGER | Créer session jury |
| 18 | `GET` | `/deliberations` | ADMIN, PEDAGOGICAL_MANAGER, SCHOOL_MANAGER | Lister délibérations |
| 19 | `GET` | `/deliberations/{id}` | ADMIN, PEDAGOGICAL_MANAGER, SCHOOL_MANAGER | Détail délibération |
| 20 | `POST` | `/deliberations/{id}/publish` | ADMIN, PEDAGOGICAL_MANAGER | Publier délibération |

---

### M03 — Devoirs & Quiz (18 endpoints)
**Base path :** `/api/v1/assignments`

| # | Méthode | URL | Rôles | Description |
|---|---|---|---|---|
| 1 | `POST` | `/` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Créer devoir |
| 2 | `GET` | `/` | Tous | Lister (`?courseId=&cohortId=&publishedOnly=false`) |
| 3 | `GET` | `/{id}` | Tous | Détail devoir |
| 4 | `PUT` | `/{id}` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Modifier |
| 5 | `PATCH` | `/{id}/publish` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Publier (visible étudiants) |
| 6 | `PATCH` | `/{id}/publish-results` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Publier résultats |
| 7 | `DELETE` | `/{id}` | ADMIN, PEDAGOGICAL_MANAGER | Archiver |
| 8 | `POST` | `/{id}/submissions` | ADMIN, STUDENT, TEACHER | Soumettre devoir (multipart, file optionnel) |
| 9 | `GET` | `/{id}/submissions` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Toutes les soumissions |
| 10 | `GET` | `/{id}/submissions/student/{studentId}` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER, STUDENT | Soumission d'un étudiant |
| 11 | `PATCH` | `/submissions/{submissionId}/grade` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Corriger (`?score=&feedback=`) |
| 12 | `PATCH` | `/submissions/{submissionId}/return` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Rendre la copie corrigée |
| 13 | `POST` | `/{id}/quiz` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Associer quiz (`?timeLimitMinutes=&passingPercentage=`) |
| 14 | `POST` | `/{id}/quiz/questions` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Ajouter question |
| 15 | `GET` | `/{id}/quiz/questions` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER, STUDENT | Lister questions |
| 16 | `POST` | `/{id}/quiz/start` | ADMIN, STUDENT | Démarrer tentative (`?studentId=`) |
| 17 | `POST` | `/quiz/attempts/{attemptId}/submit` | ADMIN, STUDENT | Soumettre réponses (correction auto QCM/Vrai-Faux) |
| 18 | `GET` | `/{id}/quiz/attempts/student/{studentId}` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER, STUDENT | Historique tentatives |

**Exemple — Soumettre un devoir avec fichier :**
```bash
curl -X POST http://localhost:8080/api/v1/assignments/5/submissions \
  -H "Authorization: Bearer <token>" \
  -F "studentId=12" \
  -F "content=Ma réponse texte" \
  -F "file=@/path/to/rapport.pdf"
```

---

### M04 — Présences (13 endpoints)
**Base path :** `/api/v1/attendance`

**Statuts présence :** `PRESENT | ABSENT | LATE | EXCUSED | REMOTE`
**Statuts justification :** `PENDING | APPROVED | REJECTED`
**Alerte assiduité :** taux < 75% → champ `belowThreshold: true`

| # | Méthode | URL | Rôles | Description |
|---|---|---|---|---|
| 1 | `POST` | `/sessions/{sessionId}` | ADMIN, TEACHER, PEDAGOGICAL_MANAGER | Marquer 1 étudiant |
| 2 | `POST` | `/bulk` | ADMIN, TEACHER, PEDAGOGICAL_MANAGER | Feuille d'appel complète (liste d'entrées) |
| 3 | `GET` | `/sessions/{sessionId}` | ADMIN, SCHOOL_MANAGER, PEDAGOGICAL_MANAGER, TEACHER | Feuille d'appel d'une session |
| 4 | `GET` | `/students/{studentId}` | ADMIN, SCHOOL_MANAGER, PEDAGOGICAL_MANAGER, TEACHER, STUDENT | Historique d'un étudiant |
| 5 | `PATCH` | `/records/{recordId}` | ADMIN, TEACHER, PEDAGOGICAL_MANAGER | Corriger statut (`?status=&teacherNote=`) |
| 6 | `DELETE` | `/records/{recordId}` | ADMIN, PEDAGOGICAL_MANAGER | Supprimer enregistrement (soft) |
| 7 | `GET` | `/stats/students/{studentId}` | ADMIN, SCHOOL_MANAGER, PEDAGOGICAL_MANAGER, TEACHER, STUDENT | Taux assiduité global |
| 8 | `GET` | `/stats/students/{studentId}/courses/{courseId}` | ADMIN, SCHOOL_MANAGER, PEDAGOGICAL_MANAGER, TEACHER, STUDENT | Taux assiduité par cours |
| 9 | `POST` | `/justifications` | ADMIN, STUDENT, TEACHER, PEDAGOGICAL_MANAGER | Soumettre justification (multipart) |
| 10 | `GET` | `/justifications/pending` | ADMIN, PEDAGOGICAL_MANAGER, SCHOOL_MANAGER | File attente validation |
| 11 | `GET` | `/justifications/students/{studentId}` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER, STUDENT | Justifications d'un étudiant |
| 12 | `PATCH` | `/justifications/{id}/review` | ADMIN, PEDAGOGICAL_MANAGER | Valider/refuser (`?decision=APPROVED&comment=`) |

**Exemple — Feuille d'appel bulk :**
```bash
curl -X POST http://localhost:8080/api/v1/attendance/bulk \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": 10,
    "entries": [
      { "studentId": 1, "status": "PRESENT" },
      { "studentId": 2, "status": "ABSENT" },
      { "studentId": 3, "status": "LATE", "teacherNote": "5 min" }
    ]
  }'
```

---

### M05 — Notes & Bulletins (12 endpoints)
**Base path :** `/api/v1/grades`

**Fonctionnement :** La moyenne pondérée (GradeBook) est recalculée automatiquement à chaque ajout/suppression de note.
**Bulletin :** `generalAverage`, `totalCreditsAcquired`, `rankInCohort`, `headTeacherComment`
**Statuts bulletin :** `DRAFT | PUBLISHED`

| # | Méthode | URL | Rôles | Description |
|---|---|---|---|---|
| 1 | `GET` | `/grade-books` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER, STUDENT | Carnet notes (`?studentId=&courseId=&academicYearId=`) |
| 2 | `GET` | `/grade-books/students/{studentId}` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER, STUDENT | Tous les carnets d'un étudiant (`?academicYearId=`) |
| 3 | `PATCH` | `/grade-books/{gradeBookId}/appreciation` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Appréciation enseignant (`?appreciation=`) |
| 4 | `POST` | `/grade-items` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Ajouter note (moyenne recalculée) |
| 5 | `DELETE` | `/grade-items/{itemId}` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Supprimer note (moyenne recalculée) |
| 6 | `POST` | `/bulletins/generate` | ADMIN, PEDAGOGICAL_MANAGER | Générer bulletin (`?studentId=&academicYearId=&semester=`) |
| 7 | `GET` | `/bulletins/students/{studentId}` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER, STUDENT | Consulter bulletin (`?academicYearId=&semester=`) |
| 8 | `PATCH` | `/bulletins/{bulletinId}/publish` | ADMIN, PEDAGOGICAL_MANAGER | Publier bulletin (`?comment=`) |
| 9 | `GET` | `/bulletins/cohorts/{cohortId}` | ADMIN, PEDAGOGICAL_MANAGER, SCHOOL_MANAGER | Bulletins cohorte (`?academicYearId=&semester=`) |
| 10 | `POST` | `/credits` | ADMIN, PEDAGOGICAL_MANAGER | Enregistrer ECTS acquis |

> **Note frontend :** L'étudiant ne voit ses bulletins que lorsque `status = PUBLISHED`.

---

### M06 — Finance (15 endpoints)
**Base path :** `/api/v1/finance`

**Statuts facture :** `PENDING | PARTIAL | PAID | OVERDUE | CANCELLED`
**Méthodes paiement :** `CASH | BANK_TRANSFER | MOBILE_MONEY | CARD | CHECK`

| # | Méthode | URL | Rôles | Description |
|---|---|---|---|---|
| 1 | `POST` | `/invoices` | ADMIN, SCHOOL_MANAGER | Créer facture (N° INV-YYYY-XXXXX auto) |
| 2 | `GET` | `/invoices/students/{studentId}` | ADMIN, SCHOOL_MANAGER, STUDENT | Factures d'un étudiant |
| 3 | `GET` | `/invoices/outstanding/{studentId}` | ADMIN, SCHOOL_MANAGER, STUDENT | Solde impayé total |
| 4 | `GET` | `/invoices/by-status` | ADMIN, SCHOOL_MANAGER | Factures par statut (`?status=OVERDUE`) |
| 5 | `POST` | `/invoices/{invoiceId}/apply-scholarship/{scholarshipId}` | ADMIN, SCHOOL_MANAGER | Appliquer bourse |
| 6 | `POST` | `/invoices/{invoiceId}/payments` | ADMIN, SCHOOL_MANAGER | Enregistrer paiement |
| 7 | `GET` | `/invoices/{invoiceId}/payments` | ADMIN, SCHOOL_MANAGER, STUDENT | Historique paiements |
| 8 | `POST` | `/invoices/{invoiceId}/schedule` | ADMIN, SCHOOL_MANAGER | Créer échéancier (`?installments=N`) |
| 9 | `GET` | `/invoices/{invoiceId}/schedule` | ADMIN, SCHOOL_MANAGER, STUDENT | Consulter échéancier |
| 10 | `POST` | `/scholarships` | ADMIN, SCHOOL_MANAGER | Créer bourse/réduction |
| 11 | `PATCH` | `/scholarships/{id}/approve` | ADMIN, SCHOOL_MANAGER | Approuver bourse |
| 12 | `GET` | `/scholarships/pending` | ADMIN, SCHOOL_MANAGER | Bourses en attente |

---

### M07 — GED / Documents (10 endpoints)
**Base path :** `/api/v1/documents`

**Types de documents :** `DIPLOMA | TRANSCRIPT | ID_CARD | CONTRACT | REPORT | CERTIFICATE | OTHER`
**Niveaux d'accès :** `PUBLIC | STUDENT | MANAGER | ADMIN`

| # | Méthode | URL | Rôles | Description |
|---|---|---|---|---|
| 1 | `POST` | `/upload` | Tous | Upload document (multipart, SHA-256 auto, versionning) |
| 2 | `POST` | `/{documentId}/versions` | Tous | Nouvelle version d'un document |
| 3 | `GET` | `/search` | Tous | Recherche (`?type=&ownerId=&keyword=`) |
| 4 | `GET` | `/owner/{ownerId}` | Tous | Documents d'un utilisateur |
| 5 | `GET` | `/reference` | ADMIN, SCHOOL_MANAGER, PEDAGOGICAL_MANAGER, TEACHER | Par entité (`?referenceType=STUDENT&referenceId=42`) |
| 6 | `GET` | `/{documentId}/versions` | Tous | Historique versions |
| 7 | `GET` | `/{documentId}/download` | Tous | Version courante (log DOWNLOAD auto) |
| 8 | `DELETE` | `/{documentId}` | ADMIN, SCHOOL_MANAGER, PEDAGOGICAL_MANAGER | Soft delete + log DELETE |
| 9 | `GET` | `/{documentId}/audit` | ADMIN, SCHOOL_MANAGER | Journal d'audit accès |

---

### M08 — Communication & Notifications (15 endpoints)
**Base path :** `/api/v1/communications`

**Types notification :** `INFO | WARNING | SUCCESS | ERROR | BADGE | GRADE | PAYMENT | ATTENDANCE`

| # | Méthode | URL | Rôles | Description |
|---|---|---|---|---|
| 1 | `GET` | `/notifications/users/{userId}` | Tous | Boîte de notifications (paginée) |
| 2 | `GET` | `/notifications/users/{userId}/unread-count` | Tous | Badge clochette (non lues) |
| 3 | `POST` | `/notifications` | ADMIN, SCHOOL_MANAGER, PEDAGOGICAL_MANAGER | Envoyer notification in-app |
| 4 | `PATCH` | `/notifications/{id}/read` | Tous | Marquer comme lue |
| 5 | `PATCH` | `/notifications/users/{userId}/read-all` | Tous | Tout marquer comme lu |
| 6 | `POST` | `/announcements` | ADMIN, SCHOOL_MANAGER, PEDAGOGICAL_MANAGER | Créer annonce |
| 7 | `GET` | `/announcements` | Tous | Annonces actives (`?audience=&cohortId=`) |
| 8 | `DELETE` | `/announcements/{id}` | ADMIN, SCHOOL_MANAGER, PEDAGOGICAL_MANAGER | Supprimer annonce |
| 9 | `POST` | `/messages` | Tous | Envoyer message interne |
| 10 | `GET` | `/messages/inbox/{userId}` | Tous | Boîte de réception |
| 11 | `GET` | `/messages/sent/{userId}` | Tous | Messages envoyés |
| 12 | `GET` | `/messages/thread/{threadId}` | Tous | Fil de conversation |
| 13 | `GET` | `/messages/users/{userId}/unread-count` | Tous | Messages non lus |
| 14 | `PATCH` | `/messages/{messageId}/read` | Tous | Marquer message comme lu |
| 15 | `GET` | `/notifications/stream` | Tous | **SSE** — Flux temps-réel (voir M14) |

---

### M09 — Mentorat (11 endpoints)
**Base path :** `/api/v1/mentoring`

**Statuts mentorat :** `ACTIVE | COMPLETED | CANCELLED`
**Statuts séance :** `PLANNED | DONE | CANCELLED`

| # | Méthode | URL | Rôles | Description |
|---|---|---|---|---|
| 1 | `POST` | `/` | ADMIN, PEDAGOGICAL_MANAGER | Créer relation mentorat |
| 2 | `PATCH` | `/{id}/status` | ADMIN, PEDAGOGICAL_MANAGER | Changer statut (`?status=ACTIVE`) |
| 3 | `GET` | `/mentees/{menteeId}` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER, STUDENT | Mentorats d'un étudiant |
| 4 | `GET` | `/mentors/{mentorId}` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Mentorats d'un mentor |
| 5 | `POST` | `/{mentorshipId}/sessions` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Planifier séance |
| 6 | `PATCH` | `/sessions/{sessionId}/status` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Statut séance (`?status=DONE&notes=`) |
| 7 | `GET` | `/{mentorshipId}/sessions` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER, STUDENT | Historique séances |
| 8 | `POST` | `/{mentorshipId}/action-plans` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Créer plan d'action |
| 9 | `PATCH` | `/action-plans/{planId}/complete` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER, STUDENT | Compléter action |
| 10 | `GET` | `/{mentorshipId}/action-plans` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER, STUDENT | Plans d'action |

---

### M10 — Carrière & Portfolio (11 endpoints)
**Base path :** `/api/v1/career`

**Types d'offres :** `INTERNSHIP | JOB | APPRENTICESHIP`
**Statuts candidature :** `PENDING | UNDER_REVIEW | INTERVIEW | ACCEPTED | REJECTED | WITHDRAWN`

| # | Méthode | URL | Rôles | Description |
|---|---|---|---|---|
| 1 | `POST` | `/offers` | ADMIN, SCHOOL_MANAGER, PEDAGOGICAL_MANAGER | Publier offre |
| 2 | `GET` | `/offers` | Tous | Rechercher offres actives (`?type=&keyword=`) |
| 3 | `PATCH` | `/offers/{offerId}/close` | ADMIN, SCHOOL_MANAGER, PEDAGOGICAL_MANAGER | Clôturer offre |
| 4 | `POST` | `/offers/{offerId}/apply` | STUDENT, ADMIN | Postuler (anti-doublon auto) |
| 5 | `PATCH` | `/applications/{appId}/status` | ADMIN, SCHOOL_MANAGER, PEDAGOGICAL_MANAGER | Statut candidature |
| 6 | `GET` | `/students/{studentId}/applications` | ADMIN, SCHOOL_MANAGER, STUDENT | Candidatures d'un étudiant |
| 7 | `GET` | `/offers/{offerId}/applications` | ADMIN, SCHOOL_MANAGER, PEDAGOGICAL_MANAGER | Candidatures d'une offre |
| 8 | `POST` | `/portfolio` | ADMIN, STUDENT | Ajouter projet portfolio |
| 9 | `GET` | `/portfolio/students/{studentId}` | Tous authentifiés | Portfolio d'un étudiant |
| 10 | `GET` | `/portfolio/showcase` | **Public** | Vitrine publique des projets |

---

### M11 — Analytics & IA (10 endpoints)
**Base path :** `/api/v1/analytics`

**Score de risque :** pondéré 40% assiduité + 40% notes + 20% devoirs (0–100, plus haut = plus à risque)
**Statuts alertes :** `OPEN | ACKNOWLEDGED | RESOLVED`

| # | Méthode | URL | Rôles | Description |
|---|---|---|---|---|
| 1 | `POST` | `/snapshots` | ADMIN, PEDAGOGICAL_MANAGER, SCHOOL_MANAGER | Calculer snapshot étudiant |
| 2 | `GET` | `/snapshots/students/{studentId}` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER, STUDENT | Historique snapshots |
| 3 | `GET` | `/snapshots/cohorts/{cohortId}/risk-ranking` | ADMIN, PEDAGOGICAL_MANAGER, SCHOOL_MANAGER | Classement risque cohorte |
| 4 | `GET` | `/alerts` | ADMIN, PEDAGOGICAL_MANAGER, SCHOOL_MANAGER | Alertes par statut (`?status=OPEN`) |
| 5 | `GET` | `/alerts/students/{studentId}` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Alertes d'un étudiant |
| 6 | `GET` | `/alerts/managers/{managerId}` | ADMIN, PEDAGOGICAL_MANAGER | Alertes assignées à un responsable |
| 7 | `GET` | `/alerts/count-open` | ADMIN, PEDAGOGICAL_MANAGER, SCHOOL_MANAGER | Nombre d'alertes ouvertes (badge) |
| 8 | `PATCH` | `/alerts/{alertId}/acknowledge` | ADMIN, PEDAGOGICAL_MANAGER | Prendre en charge alerte |
| 9 | `PATCH` | `/alerts/{alertId}/resolve` | ADMIN, PEDAGOGICAL_MANAGER | Résoudre alerte |

**Paramètres calcul snapshot (tous optionnels si batch) :**

| Paramètre | Type | Description |
|---|---|---|
| `attendanceRate` | `BigDecimal` | Taux assiduité 0–100 |
| `averageGrade` | `BigDecimal` | Moyenne générale /20 |
| `assignmentCompletionRate` | `BigDecimal` | Taux completion devoirs 0–100 |
| `ectsEarned` | `Integer` | ECTS acquis |
| `lateSubmissions` | `Integer` | Nombre de soumissions tardives |
| `unjustifiedAbsences` | `Integer` | Absences non justifiées |
| `cohortRank` | `Integer` | Rang dans la cohorte |

---

### M12 — Planning & Agenda (8 endpoints)
**Base path :** `/api/v1/planning`

**Types d'événements :** `COURSE_SESSION | EXAM | DEADLINE | MENTOR_SESSION | HOLIDAY | MEETING | OTHER`
**Récurrence :** format `recurrenceRule` conforme RFC 5545 iCalendar (`FREQ=WEEKLY;BYDAY=MO,WE`)

| # | Méthode | URL | Rôles | Description |
|---|---|---|---|---|
| 1 | `GET` | `/agenda` | Tous authentifiés | Agenda personnel (`?userId=&from=&to=` ISO_DATE_TIME) |
| 2 | `GET` | `/cohorts/{cohortId}/agenda` | Tous authentifiés | Agenda cohorte (`?from=&to=`) |
| 3 | `GET` | `/teachers/{teacherId}/slots` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Créneaux enseignant |
| 4 | `POST` | `/events` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Créer événement |
| 5 | `PUT` | `/events/{id}` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Modifier événement |
| 6 | `POST` | `/events/{id}/cancel` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Annuler (`?reason=`) |
| 7 | `DELETE` | `/events/{id}` | ADMIN, PEDAGOGICAL_MANAGER | Supprimer (soft) |
| 8 | `GET` | `/events/{id}/conflicts` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Détecter conflits horaires |

**Exemple — Créer un événement :**
```bash
curl -X POST "http://localhost:8080/api/v1/planning/events?eventType=EXAM&title=Examen+Final&startAt=2026-06-15T09:00:00&endAt=2026-06-15T12:00:00&cohortId=1&teacherId=5" \
  -H "Authorization: Bearer <token>"
```

---

### M13 — Compétences & Badges (10 endpoints)
**Base path :** `/api/v1/competences`

**Niveaux compétence :** `BEGINNER | INTERMEDIATE | ADVANCED | EXPERT`
**Auto-badge :** Attribution automatique si ≥ 5 compétences validates (configurable via `autoAward`)

| # | Méthode | URL | Rôles | Description |
|---|---|---|---|---|
| 1 | `POST` | `/` | ADMIN, PEDAGOGICAL_MANAGER | Créer compétence (code UNIQUE) |
| 2 | `GET` | `/` | Tous authentifiés | Référentiel complet |
| 3 | `GET` | `/programs/{programId}` | Tous authentifiés | Compétences d'un programme |
| 4 | `DELETE` | `/{id}` | ADMIN | Archiver compétence |
| 5 | `POST` | `/acquisitions` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Enregistrer acquisition (badge auto) |
| 6 | `GET` | `/students/{studentId}/portfolio` | Tous authentifiés | Portfolio compétences étudiant |
| 7 | `POST` | `/badges` | ADMIN, PEDAGOGICAL_MANAGER | Créer badge numérique |
| 8 | `GET` | `/badges` | Tous authentifiés | Catalogue badges |
| 9 | `POST` | `/badges/{badgeId}/award` | ADMIN, PEDAGOGICAL_MANAGER, TEACHER | Attribuer badge manuellement |
| 10 | `GET` | `/students/{studentId}/badges` | Tous authentifiés | Badges d'un étudiant |

---

### M14 — SSE Notifications (1 endpoint)
**Base path :** `/api/v1/communications`

> **⚠️ Traitement spécial :** Cet endpoint retourne un flux `text/event-stream` persistant. Ne pas fermer la connexion côté client.

| Méthode | URL | Content-Type | Description |
|---|---|---|---|
| `GET` | `/notifications/stream` | `text/event-stream` | Flux SSE temps-réel de l'utilisateur |

**Paramètre requis :** `?userId=<id>` ou utilisateur extrait du JWT

**Implémentation côté client (JavaScript) :**
```javascript
const evtSource = new EventSource(
  'http://localhost:8080/api/v1/communications/notifications/stream',
  { headers: { 'Authorization': 'Bearer ' + token } }
);

evtSource.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('Nouvelle notification :', notification);
};

evtSource.onerror = () => {
  console.log('SSE déconnecté — reconnexion auto...');
};
```

**Configuration serveur :**
- Timeout connexion : 30 minutes (`SseEmitter(1_800_000L)`)
- Thread-safe : `ConcurrentHashMap` par `userId`
- Nettoyage auto : à la fermeture ou timeout

---

### M15 — Export PDF (3 endpoints)
**Base path :** `/api/v1/pdf`

> **⚠️ Traitement spécial :** Ces endpoints retournent `application/pdf` (pas du JSON). Le header `Content-Disposition: attachment; filename="..."` déclenche le téléchargement.

| # | Méthode | URL | Rôles | Description |
|---|---|---|---|---|
| 1 | `GET` | `/bulletins/{bulletinId}` | Tous authentifiés | Bulletin en PDF (`bulletin_42.pdf`) |
| 2 | `GET` | `/transcripts/{studentId}` | Tous authentifiés | Relevé de notes PDF (`releve_12.pdf`, `?academicYearId=`) |
| 3 | `GET` | `/status` | ADMIN | Statut du service PDF |

**Exemple :**
```bash
# Télécharger le bulletin 42 en PDF
curl -o bulletin_42.pdf \
  http://localhost:8080/api/v1/pdf/bulletins/42 \
  -H "Authorization: Bearer <token>"

# Télécharger le relevé de notes de l'étudiant 12 pour l'année 3
curl -o releve_etudiant_12.pdf \
  "http://localhost:8080/api/v1/pdf/transcripts/12?academicYearId=3" \
  -H "Authorization: Bearer <token>"
```

**Contenu du bulletin PDF :**
- Informations étudiant (nom, numéro étudiant, semestre, année)
- Tableau des notes par cours : label, note /20, coefficient, type
- Résumé : `generalAverage`, `totalCreditsAcquired / totalCreditsPossible`, `rankInCohort`, `classAverage`
- Appréciation du responsable (`headTeacherComment`), décision du conseil (`councilDecision`)

---

### M16 — Batch Analytics (0 endpoint)

Service automatique (`@Scheduled`) — pas d'endpoint HTTP exposé.

```
Fréquence : chaque nuit à 2h00 (cron: "0 0 2 * * *")
Action    : calcul automatique des snapshots analytiques pour tous les étudiants actifs
Activation: @EnableScheduling dans BackendApplication.java
```

---

### M17 — Email Service (0 endpoint)

Service interne (`@Async`) — déclenché par les autres modules, pas d'endpoint HTTP.

| Méthode | Déclencheur | Description |
|---|---|---|
| `sendAdmissionConfirmation()` | Admission VALIDATED | Email confirmation candidature |
| `sendRiskAlert()` | Score risque > seuil | Alerte décrochage au responsable |
| `sendBulletinPublished()` | Bulletin PUBLISHED | Notification bulletin disponible |
| `sendInvoice()` | Facture créée | Email facture avec montant |
| `sendBadgeAwarded()` | Badge attribué | Félicitations badge numérique |

**Configuration SMTP (application.properties) :**
```properties
# Développement local (MailHog)
spring.mail.host=localhost
spring.mail.port=1025

# Production (ex: Gmail)
# spring.mail.host=smtp.gmail.com
# spring.mail.port=587
# spring.mail.username=noreply@mydbs.fr
# spring.mail.password=<app-password>
# spring.mail.properties.mail.smtp.auth=true
# spring.mail.properties.mail.smtp.starttls.enable=true
```

---

### M18 — Tests

**Test de démarrage (smoke test) :**
```bash
./mvnw test
```

Classe : `BackendApplicationTests` — vérifie que le contexte Spring Boot complet démarre sans erreur.

---

## 3. Modèle de données

### 3.1 Relations principales

```
AcademicYear ─┬─── Student ──────┬─── GradeBook ──── GradeItem
              │                  ├─── Bulletin
              │                  ├─── AttendanceRecord
              │                  ├─── Invoice ──────── Payment
              │                  ├─── JobApplication
              │                  └─── CompetenceAcquisition ─── BadgeAward

Program ──────┴─── Course ─────── Session ─── AttendanceRecord
                                │
                                └── Evaluation ── EvaluationResult
                                └── Assignment ── Submission ── Quiz ── Attempt

Cohort ────────── Bulletin (classement)
                ── AnalyticsSnapshot ── RiskAlert

User ──────────── Notification
               ── Message
               ── Announcement
               ── ScheduleEvent
               ── ManagedDocument

Mentorship ──── MentoringSession
            └── ActionPlan
```

### 3.2 Principales entités par module

| Module | Entités principales |
|---|---|
| Admissions | `AdmissionApplication`, `SupportingDocument`, `AdmissionNote` |
| Évaluations | `Evaluation`, `EvaluationResult`, `RubricCriterion`, `Deliberation` |
| Devoirs & Quiz | `Assignment`, `Submission`, `Quiz`, `Question`, `Attempt`, `AttemptAnswer` |
| Présences | `AttendanceRecord`, `AttendanceJustification` |
| Notes | `GradeBook`, `GradeItem`, `Bulletin`, `CreditAcquisition`, `Transcript` |
| Finance | `Invoice`, `Payment`, `PaymentSchedule`, `Scholarship` |
| GED | `ManagedDocument`, `DocumentVersion`, `DocumentAccessLog` |
| Communication | `Notification`, `Announcement`, `Message` |
| Mentorat | `Mentorship`, `MentoringSession`, `ActionPlan` |
| Carrière | `JobOffer`, `JobApplication`, `PortfolioProject` |
| Analytics | `AnalyticsSnapshot`, `RiskAlert` |
| Planning | `ScheduleEvent` |
| Compétences | `Competence`, `CompetenceAcquisition`, `Badge`, `BadgeAward` |

---

## 4. Guide de démarrage rapide

### 4.1 Prérequis

| Composant | Version minimale |
|---|---|
| JDK | 21 (Temurin / Oracle) |
| Maven | 3.9+ (ou utiliser `./mvnw`) |
| MySQL | 8.0+ |
| Docker | Optionnel (MailHog, Testcontainers) |

### 4.2 Configuration

**`src/main/resources/application-local.properties`** (à créer) :
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mydbs_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=votre_mot_de_passe
spring.jpa.hibernate.ddl-auto=none
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
```

**Base de données :**
```sql
CREATE DATABASE mydbs_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4.3 Compilation

```bash
cd my-school-main/backend
./mvnw clean compile
# Attendu : BUILD SUCCESS
```

> **Note :** Les erreurs IDE (`String cannot be resolved`, etc.) sont des **faux-positifs** du classpath Eclipse. Seul Maven fait foi.

### 4.4 Lancement

```bash
./mvnw spring-boot:run
# Le serveur démarre sur http://localhost:8080
# Logs attendus : "Started BackendApplication in X.XXX seconds"
```

**Bootstrapping automatique :** À la première exécution, un compte `SUPER_ADMIN` est créé :
- Email : `admin@mydbs.com`
- Password : `Admin@123456`

### 4.5 Tests

```bash
./mvnw test
# Smoke test : vérification démarrage contexte Spring
```

### 4.6 Swagger UI

```
http://localhost:8080/swagger-ui.html
```

**Tags API attendus dans Swagger :**
`Admissions` · `Evaluations` · `Assignments & Quizzes` · `Attendance` · `Grades & Bulletins` · `Finance` · `GED / Documents` · `Communication & Notifications` · `Mentorat` · `Carrière & Portfolio` · `Analytics & IA` · `Planning & Agenda` · `Compétences & Badges` · `Export PDF`

**API JSON brut :**
```
http://localhost:8080/api-docs
```

---

## 5. Annexes

### 5.1 Codes HTTP utilisés

| Code | Signification | Contexte |
|---|---|---|
| `200 OK` | Succès | GET, PATCH, PUT |
| `201 Created` | Ressource créée | POST |
| `204 No Content` | Suppression réussie | DELETE |
| `400 Bad Request` | Paramètre invalide ou manquant | Validation `@Valid` |
| `401 Unauthorized` | Token absent ou expiré | Toutes routes protégées |
| `403 Forbidden` | Rôle insuffisant | `@PreAuthorize` |
| `404 Not Found` | Ressource introuvable | `ResourceNotFoundException` |
| `409 Conflict` | Unicité violée | Doublon (UNIQUE constraint) |
| `500 Internal Server Error` | Erreur serveur | Exception non gérée |

### 5.2 Enums communs

**Statuts candidature :**
`DRAFT` · `PENDING_REVIEW` · `UNDER_REVIEW` · `VALIDATED` · `ENROLLED` · `REJECTED` · `WITHDRAWN`

**Statuts évaluation :**
`DRAFT` · `SCHEDULED` · `IN_PROGRESS` · `CLOSED` · `RESULTS_PUBLISHED`

**Statuts bulletin :**
`DRAFT` · `PUBLISHED`

**Statuts facture :**
`PENDING` · `PARTIAL` · `PAID` · `OVERDUE` · `CANCELLED`

**Statuts présence :**
`PRESENT` · `ABSENT` · `LATE` · `EXCUSED` · `REMOTE`

**Types événement planning :**
`COURSE_SESSION` · `EXAM` · `DEADLINE` · `MENTOR_SESSION` · `HOLIDAY` · `MEETING` · `OTHER`

**Niveaux compétence :**
`BEGINNER` · `INTERMEDIATE` · `ADVANCED` · `EXPERT`

**Types document GED :**
`DIPLOMA` · `TRANSCRIPT` · `ID_CARD` · `CONTRACT` · `REPORT` · `CERTIFICATE` · `OTHER`

**Types notification :**
`INFO` · `WARNING` · `SUCCESS` · `ERROR` · `BADGE` · `GRADE` · `PAYMENT` · `ATTENDANCE`

**Méthodes de paiement :**
`CASH` · `BANK_TRANSFER` · `MOBILE_MONEY` · `CARD` · `CHECK`

### 5.3 Format des dates

| Format | Exemple | Utilisation |
|---|---|---|
| `yyyy-MM-dd` | `2026-09-01` | Dates simples (date d'admission, deadline) |
| `yyyy-MM-ddTHH:mm:ss` | `2026-09-01T09:00:00` | DateTime (événements, planning) |
| ISO 8601 | `2026-03-24T21:38:00+01:00` | Timestamps (createdAt, updatedAt) |

> **Spring Config :** `spring.jackson.serialization.WRITE_DATES_AS_TIMESTAMPS=false` force le format ISO 8601 dans toutes les réponses JSON.

### 5.4 Structure standard de la réponse API

```json
{
  "success": true,
  "message": "Candidature créée avec succès",
  "data": { ... },
  "timestamp": "2026-03-24T21:38:00.123"
}
```

En cas d'erreur :
```json
{
  "success": false,
  "message": "Bulletin introuvable : 99",
  "data": null,
  "timestamp": "2026-03-24T21:38:00.456"
}
```

### 5.5 Pagination

Tous les endpoints paginés acceptent :
```
?page=0&size=20&sort=createdAt,desc
```

La réponse est de type `Page<T>` :
```json
{
  "data": {
    "content": [...],
    "totalElements": 157,
    "totalPages": 8,
    "size": 20,
    "number": 0
  }
}
```

---

*Document généré à partir du code source de MyDBS Backend — Tous les endpoints ont été extraits directement des controllers Java.*
