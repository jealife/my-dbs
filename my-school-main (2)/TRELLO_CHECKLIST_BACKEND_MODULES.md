# MyDBS Backend — Checklists Trello (Modules existants)

## M00 — Fondations / Transverse
- [x] BackendApplication (Spring Boot)
- [x] common (exceptions, réponses API, utilitaires)
- [x] config (security, auditor, configuration globale)
- [x] bootstrap (données initiales / seed)

## M00 — Authentification & Sécurité
- [x] auth (JWT, services auth, security)
- [x] user (gestion des utilisateurs, rôles, statuts)

## M01 — Admissions
- [x] admissions (candidatures, pièces justificatives, notes d’admission)

## M02 — Évaluations
- [x] evaluation (évaluations, délibérations, logique métier associée)

## M03 — Devoirs & Quiz
- [x] assignment (assignments, quiz, submissions)

## M04 — Présences
- [x] attendance (présences, absences, suivi)

## M05 — Notes & Bulletins
- [x] grades (notes, bulletins, calculs)

## M06 — Finance
- [x] finance (paiements, frais, scolarité)

## M07 — GED / Documents
- [x] documents (gestion documentaire)
- [x] pdf (génération/export PDF)

## M08 — Communication / Notifications
- [x] notification (notifications, canaux)
- [x] email (service email)

## M09 — Mentorat
- [x] mentoring (mentorat, suivi)

## M10 — Carrière & Portfolio
- [x] career (carrière, portfolio)

## M11 — Analytics & IA
- [x] analytics (stats, analytics)

## M12 — Planning & Agenda
- [x] planning (agenda, planning)

## M13 — Compétences & Badges
- [x] competence (compétences, badges)

## M14 — SSE Notifications
- [x] SSE registry (notification.sse.SseEmitterRegistry)
- [x] Endpoint SSE GET `/api/v1/communications/notifications/stream`
- [x] Push temps-réel lors de `NotificationServiceImpl.push()` (sendToUser)

## M15 — Export PDF
- [x] PdfController (endpoints bulletins / transcripts / status)
- [x] PdfService (génération iText)

## M16 — Batch Analytics
- [x] Scheduling activé (`@EnableScheduling`)
- [x] Job nocturne `nocturnalSnapshotBatch()` avec `@Scheduled(cron = "0 0 2 * * *")`

## M17 — Email Service
- [x] EmailService (service réel)
- [x] Intégration emails (Admissions / Notes / Finance)
- [x] Async activé (`@EnableAsync`)

## M18 — Tests
- [x] Smoke test Spring Boot (`BackendApplicationTests#contextLoads`)

## M19 — Scolarité (référentiels)
- [x] academic (programmes, cohortes, années académiques)
- [x] course (cours, modules, leçons, sessions, ressources)
- [x] student (étudiants)
- [x] teacher (enseignants)
