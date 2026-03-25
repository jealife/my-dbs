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
-- Table structure for table `evaluations`
--

DROP TABLE IF EXISTS `evaluations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `archived` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `created_by` varchar(150) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(150) DEFAULT NULL,
  `coefficient` double NOT NULL,
  `description` varchar(2000) DEFAULT NULL,
  `duration_minutes` int DEFAULT NULL,
  `evaluation_type` enum('CONTINUOUS_ASSESSMENT','FINAL_EXAM','HOMEWORK','ORAL_EXAM','PARTIAL_EXAM','PRACTICAL_WORK','PROJECT','REMEDIAL_EXAM') NOT NULL,
  `instructions` varchar(3000) DEFAULT NULL,
  `max_score` double NOT NULL,
  `passing_score` double NOT NULL,
  `results_published_at` datetime(6) DEFAULT NULL,
  `room_info` varchar(200) DEFAULT NULL,
  `scheduled_at` datetime(6) DEFAULT NULL,
  `semester` varchar(20) DEFAULT NULL,
  `status` enum('CLOSED','DRAFT','IN_PROGRESS','RESULTS_PUBLISHED','SCHEDULED') NOT NULL,
  `title` varchar(200) NOT NULL,
  `weight_percentage` double DEFAULT NULL,
  `academic_year_id` bigint NOT NULL,
  `class_id` bigint DEFAULT NULL,
  `cohort_id` bigint DEFAULT NULL,
  `course_id` bigint NOT NULL,
  `created_by_user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_eval_status` (`status`),
  KEY `idx_eval_course` (`course_id`),
  KEY `idx_eval_cohort` (`cohort_id`),
  KEY `idx_eval_year` (`academic_year_id`),
  KEY `idx_eval_type` (`evaluation_type`),
  KEY `fk_eval_class` (`class_id`),
  KEY `fk_eval_creator` (`created_by_user_id`),
  CONSTRAINT `fk_eval_academic_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`),
  CONSTRAINT `fk_eval_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
  CONSTRAINT `fk_eval_cohort` FOREIGN KEY (`cohort_id`) REFERENCES `cohorts` (`id`),
  CONSTRAINT `fk_eval_creator` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`)
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

-- Dump completed on 2026-03-25 11:27:38
