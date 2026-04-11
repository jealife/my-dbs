# Parcours Utilisateur : Administrateur (Admin / Super Admin)

L'administrateur est au cœur du système MyDBS, avec des pouvoirs étendus sur la gestion institutionnelle et pédagogique.

## 1. Authentification & Accès
- **Login** : L'admin se connecte via `/login`. Le backend vérifie les identifiants dans la table `users`.
- **JWT** : Si succès, un token JWT est généré et stocké dans les cookies.
- **Redirection** : Redirection vers le dashboard `/overview`.

## 2. Gestion des Utilisateurs (Interface `/users`)
C'est ici que l'admin gère le personnel et les élèves.
- **Liste Globale** : Appel à `GET /api/users` ou `GET /api/users?role=...`.
- **Ajout Utilisateur** :
    - Ouverture du `AddUserModal`.
    - L'admin choisit le rôle (ADMIN, TEACHER, STUDENT, FINANCE, etc.).
    - **Base de Données** : Une entrée est créée dans `users`. Si le rôle est TEACHER ou STUDENT, une entrée correspondante est également créée dans les tables `teachers` ou `students`.
- **Édition** : Modification des informations via `PUT /api/users/{id}`, `PUT /api/students/{id}` ou `PUT /api/teachers/{id}`.
- **Suppression** : Appel à `DELETE /api/users/{id}` (soft-delete ou archivage recommandé).

## 3. Gestion Académique (Interface `/academic`)
L'admin définit la structure de l'école.
- **Années Académiques** : Création/Liste via `/api/academic-years`.
- **Programmes (Filières)** : Création via `/api/programs`. Un programme est lié à une école.
- **Cohortes (Niveaux)** : Création via `/api/cohorts`. Une cohorte est liée à un programme.
- **Classes** : Création via `/api/classes`. Une classe appartient à une cohorte pour une année donnée.

## 4. Gestion LMS (Interface `/courses` & `/lms`)
Contrôle du contenu pédagogique.
- **Cours** : Création de cours liés à des professeurs.
- **Contenu** : Ajout de modules, leçons et ressources (PDF, Vidéos).

## 5. Interactions Base de Données (DB)
- **Synchronisation** : Toute création d'un étudiant/enseignant déclenche une relation One-to-One avec un compte `User`.
- **Sécurité** : Chaque action est filtrée par le rôle (`SUPER_ADMIN` ou `ADMIN`) via Spring Security.
