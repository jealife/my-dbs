# Schéma de la Base de Données - My School Backend

Ce document décrit la structure complète de la base de données du backend. Le système utilise JPA (Hibernate) pour le mapping objet-relationnel.

## Sommaire
1. [Base Audit Entity (Données communes)](#base-audit-entity)
2. [Gestion des Utilisateurs](#gestion-des-utilisateurs)
3. [Structure Académique](#structure-académique)
4. [Gestion des Enseignants](#gestion-des-enseignants)
5. [Gestion des Étudiants](#gestion-des-étudiants)
6. [Learning Management System (LMS)](#learning-management-system-lms)
7. [Énumérations (Enums)](#énumérations-enums)

---

## 1. Base Audit Entity
Toutes les entités (sauf `User`) héritent de ces champs communs pour l'audit.

| Colonne | Type | Description |
| :--- | :--- | :--- |
| `id` | `Long` | Clé primaire (Auto-increment) |
| `created_at` | `LocalDateTime` | Date de création |
| `updated_at` | `LocalDateTime` | Date de dernière mise à jour |
| `created_by` | `String(150)` | Utilisateur ayant créé l'entrée |
| `updated_by` | `String(150)` | Utilisateur ayant mis à jour l'entrée |
| `archived` | `boolean` | Indique si l'entrée est archivée |

---

## 2. Gestion des Utilisateurs

### Table: `users`
Contient les informations de compte pour tous les types d'utilisateurs.

| Colonne | Type | Contraintes |
| :--- | :--- | :--- |
| `id` | `Long` | PK |
| `user_code` | `String(30)` | Unique, Not Null |
| `first_name` | `String(100)` | Not Null |
| `last_name` | `String(100)` | Not Null |
| `email` | `String(150)` | Unique, Not Null |
| `phone_number` | `String(30)` | |
| `password` | `String(255)` | Not Null |
| `role` | `Enum (UserRole)` | Not Null |
| `status` | `Enum (UserStatus)` | Not Null |
| `is_deleted` | `boolean` | Not Null, Default: false |
| `created_at` | `LocalDateTime` | Not Null |
| `updated_at` | `LocalDateTime` | |

---

## 3. Structure Académique

### Table: `academic_years`
| Colonne | Type | Contraintes |
| :--- | :--- | :--- |
| `name` | `String(120)` | Not Null |
| `code` | `String(40)` | Unique, Not Null |
| `description` | `String(500)` | |
| `start_date` | `LocalDate` | Not Null |
| `end_date` | `LocalDate` | Not Null |
| `current_year` | `boolean` | Not Null |
| `status` | `Enum (AcademicYearStatus)` | Not Null |

### Table: `programs`
| Colonne | Type | Contraintes |
| :--- | :--- | :--- |
| `name` | `String(150)` | Not Null |
| `code` | `String(40)` | Unique, Not Null |
| `description` | `String(1000)` | |
| `department_name` | `String(150)` | |
| `faculty_name` | `String(150)` | |
| `level` | `String(80)` | Not Null |
| `duration_in_months` | `Integer` | Not Null |
| `credits_required` | `Integer` | Not Null |
| `status` | `Enum (ProgramStatus)` | Not Null |

### Table: `cohorts`
| Colonne | Type | Contraintes |
| :--- | :--- | :--- |
| `name` | `String(150)` | Not Null |
| `code` | `String(40)` | Unique, Not Null |
| `max_capacity` | `Integer` | |
| `status` | `Enum (CohortStatus)` | Not Null |
| `academic_year_id` | `Long` | FK -> `academic_years` |
| `program_id` | `Long` | FK -> `programs` |

### Table: `class_rooms`
| Colonne | Type | Contraintes |
| :--- | :--- | :--- |
| `name` | `String(150)` | Not Null |
| `code` | `String(40)` | Unique, Not Null |
| `capacity` | `Integer` | |
| `delivery_mode` | `String(50)` | |
| `room_label` | `String(100)` | |
| `status` | `Enum (ClassRoomStatus)` | Not Null |
| `academic_year_id` | `Long` | FK -> `academic_years` |
| `program_id` | `Long` | FK -> `programs` |
| `cohort_id` | `Long` | FK -> `cohorts` |

---

## 4. Gestion des Enseignants

### Table: `teachers`
| Colonne | Type | Contraintes |
| :--- | :--- | :--- |
| `teacher_number` | `String(50)` | Unique, Not Null |
| `first_name` | `String(120)` | Not Null |
| `last_name` | `String(120)` | Not Null |
| `email` | `String(180)` | |
| `status` | `Enum (TeacherStatus)` | Not Null |
| `employment_type` | `Enum (EmploymentType)` | Not Null |
| `user_id` | `Long` | FK -> `users` (Unique) |
| `academic_year_id` | `Long` | FK -> `academic_years` |
| `program_id` | `Long` | FK -> `programs` |
| `class_id` | `Long` | FK -> `class_rooms` |

---

## 5. Gestion des Étudiants

### Table: `students`
| Colonne | Type | Contraintes |
| :--- | :--- | :--- |
| `student_number` | `String(50)` | Unique, Not Null |
| `first_name` | `String(120)` | Not Null |
| `last_name` | `String(120)` | Not Null |
| `status` | `Enum (StudentStatus)` | Not Null |
| `enrollment_type` | `Enum (EnrollmentType)` | Not Null |
| `user_id` | `Long` | FK -> `users` (Unique) |
| `academic_year_id` | `Long` | FK -> `academic_years` |
| `program_id` | `Long` | FK -> `programs` |
| `cohort_id` | `Long` | FK -> `cohorts` |
| `class_id` | `Long` | FK -> `class_rooms` |

---

## 6. Learning Management System (LMS)

### Table: `courses`
| Colonne | Type | Contraintes |
| :--- | :--- | :--- |
| `title` | `String(180)` | Not Null |
| `code` | `String(40)` | Unique, Not Null |
| `credits` | `Integer` | Not Null |
| `coefficient` | `Double` | Not Null |
| `total_hours` | `Integer` | Not Null |
| `status` | `Enum (CourseStatus)` | Not Null |
| `academic_year_id` | `Long` | FK -> `academic_years` |
| `program_id` | `Long` | FK -> `programs` |
| `class_id` | `Long` | FK -> `class_rooms` |
| `instructor_user_id` | `Long` | FK -> `users` |

---

## 7. Énumérations (Enums)

- **UserRole**: `ADMIN`, `TEACHER`, `STUDENT`, `STAFF`, `PARENT`
- **UserStatus**: `ACTIVE`, `INACTIVE`, `PENDING`, `BANNED`
- **AcademicYearStatus**: `PLANNED`, `ACTIVE`, `ARCHIVED`
- **ProgramStatus**: `DRAFT`, `ACTIVE`, `INACTIVE`, `ARCHIVED`
- **StudentStatus**: `APPLIED`, `ADMITTED`, `ENROLLED`, `ACTIVE`, `SUSPENDED`, `GRADUATED`, `WITHDRAWN`
- **TeacherStatus**: `PENDING`, `ACTIVE`, `INACTIVE`, `ON_LEAVE`, `TERMINATED`
- **CourseStatus**: `DRAFT`, `ACTIVE`, `ARCHIVED`
- **SessionMode**: `ONSITE`, `ONLINE`, `HYBRID`
