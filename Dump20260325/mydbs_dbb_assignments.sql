-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: mydbs_dbb
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `archived` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `created_by` varchar(150) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(150) DEFAULT NULL,
  `allow_late_submission` bit(1) NOT NULL,
  `assignment_type` enum('CASE_STUDY','HOMEWORK','PRACTICAL_WORK','PROJECT','QUIZ','RESEARCH') NOT NULL,
  `available_from` datetime(6) DEFAULT NULL,
  `coefficient` double NOT NULL,
  `description` varchar(4000) DEFAULT NULL,
  `due_date` datetime(6) NOT NULL,
  `instructions` varchar(4000) DEFAULT NULL,
  `late_penalty_percent` double DEFAULT NULL,
  `max_attempts` int DEFAULT NULL,
  `max_score` double NOT NULL,
  `passing_score` double DEFAULT NULL,
  `published` bit(1) NOT NULL,
  `results_published` bit(1) NOT NULL,
  `semester` varchar(20) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `academic_year_id` bigint NOT NULL,
  `cohort_id` bigint DEFAULT NULL,
  `course_id` bigint NOT NULL,
  `created_by_user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_assignment_course` (`course_id`),
  KEY `idx_assignment_cohort` (`cohort_id`),
  KEY `idx_assignment_year` (`academic_year_id`),
  KEY `idx_assignment_type` (`assignment_type`),
  KEY `idx_assignment_due` (`due_date`),
  KEY `fk_assignment_creator` (`created_by_user_id`),
  CONSTRAINT `fk_assignment_academic_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`),
  CONSTRAINT `fk_assignment_cohort` FOREIGN KEY (`cohort_id`) REFERENCES `cohorts` (`id`),
  CONSTRAINT `fk_assignment_creator` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-25 11:27:27
