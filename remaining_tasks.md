# Éléments Restants à Implémenter (Roadmap MyDBS)

Plusieurs briques fonctionnelles sont en cours de développement pour atteindre la pleine maturité du système.

## 1. Module de Communication & Messagerie
- **Messagerie Interne** : Interface de chat temps-réel entre enseignants et étudiants.
- **Système de Notifications** : Intégration complète des `SSE` (Server-Sent Events) pour les alertes (notes publiées, devoirs à rendre).

## 2. Module de Finance & Paiements
- **Gestion des Scolarités** : Suivi des paiements, facturation automatique.
- **Interface Trésorerie** : Rôle spécifique `FINANCE` pour la gestion des encaissements.

## 3. LMS & Évaluations (Avancé)
- **Quiz Interactifs** : Moteur de rendu des quiz avec chronomètre et notation automatique.
- **Bulletins de Notes** : Génération de PDF (via `/api/v1/pdf`) des bulletins semestriels.

## 4. Administration & Système
- **Audit Logs** : Traçabilité de toutes les actions administratives sensibles.
- **Rapports Analytiques** : Graphiques de performance globale de l'établissement.

## 5. Optimisations Techniques
- **PWA (Avancé)** : Mise en cache hors-ligne de tout le contenu textuel des cours.
- **Internationalisation** : Support multilingue complet (i18n).
