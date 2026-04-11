# Parcours Utilisateur : Enseignant (Teacher)

L'enseignant assure la transmission du savoir dans le système MyDBS.

## 1. Authentification & Connexion
- **Première Connexion** : Reçoit son `initialPassword` généré par l'admin.
- **Login** : Entre ses identifiants. Le token JWT le redirige vers son tableau de bord spécifique (`TeacherDashboard`).

## 2. Dashboard Pédagogique
- **Mes Cours** : Vue d'ensemble sur l'ensemble des cours qu'il dispense (extraits de `/api/teachers/courses`).
- **Statistiques** : Vue sur le nombre d'étudiants inscrits à ses cours et la progression moyenne des classes.

## 3. Gestion LMS (Interface `/courses` & `/lms`)
Le cœur de l'expérience d'apprentissage.
- **Ajout de Contenu** : L'enseignant a accès aux outils de création de contenu via `/api/courses`.
- **Ajout de Leçons** : Ajoute des modules, des leçons et des ressources (PDF, Vidéos).
- **Gestion des Ressources** : Télécharge des PDF, ajoute des vidéos via des liens externes (YouTube/Vimeo).
- **Examens & Quiz** : Crée des examens via `/api/v1/evaluations` et des quiz via `/api/v1/assignments`.

## 4. Profil & Identité (Interface `/profile`)
- **Édition limitée** : L'enseignant peut modifier ses informations personnelles (Bio, Téléphone, Adresse), mais pas ses informations professionnelles (Salaire, Charge de cours), qui sont en lecture seule. Verrouillé par le rôle `TEACHER`.
- **Photo de Profil** : Téléversement via `/api/users/{id}/photo`.

## 5. Interactions Base de Données (DB)
- **Relation Enseignant** : L'enseignant est lié à ses `Cours` via la table `courses`.
- **Contenu** : Une table stocke les modules, les leçons et les ressources créés par l'enseignant.
- **Notes** : Ses résultats sont stockés dans la table `grades`, liant l'enseignant au contenu évalué.
