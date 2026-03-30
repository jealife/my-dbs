# Parcours Utilisateur : Étudiant (Student)

L'étudiant est l'utilisateur principal des ressources pédagogiques de MyDBS.

## 1. Authentification & Connexion
- **Première Connexion** : Reçoit son `initialPassword` généré par l'admin.
- **Login** : Entre ses identifiants. Le token JWT le redirige vers son tableau de bord spécifique (`StudentDashboard`).

## 2. Dashboard École & Statistiques
- **Aperçu Académique** : Vue d'ensemble sur sa `moyenne générale` (extraite de `/api/v1/grades`) et sa `progression` (basée sur les cours complétés).
- **Emploi du Temps** : Consulte ses cours du jour (extraits de `/api/v1/planning`).
- **Ressources Récentes** : Accès rapide aux derniers fichiers déposés par ses enseignants (extraits de `/api/v1/documents`).

## 3. Accès LMS (Interface `/courses` & `/lms`)
Le cœur de l'expérience d'apprentissage.
- **Mes Cours** : Seuls les cours associés à sa `Classe` (trouvée via `Student` -> `Class` -> `Courses`) sont affichés.
- **Liste des Leçons** : Accède aux modules et aux chapitres. Markable as "terminé".
- **Ressources** : Télécharge des PDF, regarde des vidéos intégrées (Vimeo/YouTube).
- **Examens & Quiz** : Accède aux quiz via `/api/v1/assignments/quiz/start`.

## 4. Profil & Identité (Interface `/profile`)
- **Édition limitée** : L'étudiant peut modifier ses informations personnelles (Bio, Téléphone, Adresse), mais pas ses informations académiques (Classe, Inscription), qui sont lecture seule. Verrouillé par le rôle `STUDENT`.
- **Photo de Profil** : Téléversement via `/api/users/{id}/photo`.

## 5. Interactions Base de Données (DB)
- **Relation Inscription** : L'étudiant est lié à une `Classe` via la table `enrollments`.
- **Progrès** : Une table de jointure stocke le statut de complétion pour chaque `Lesson`.
- **Notes** : Ses résultats sont stockés dans la table `grades`, liant l'étudiant à une évaluation spécifique.
