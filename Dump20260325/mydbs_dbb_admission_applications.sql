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
-- Table structure for table `admission_applications`
--

DROP TABLE IF EXISTS `admission_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admission_applications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `archived` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `created_by` varchar(150) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(150) DEFAULT NULL,
  `address_line` varchar(255) DEFAULT NULL,
  `application_number` varchar(50) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `decided_at` datetime(6) DEFAULT NULL,
  `email` varchar(180) NOT NULL,
  `first_name` varchar(120) NOT NULL,
  `gender` varchar(30) DEFAULT NULL,
  `last_name` varchar(120) NOT NULL,
  `motivation_letter` text,
  `nationality` varchar(80) DEFAULT NULL,
  `phone_number` varchar(40) DEFAULT NULL,
  `priority` enum('HIGH','LOW','NORMAL','URGENT') NOT NULL,
  `rejection_reason` varchar(1000) DEFAULT NULL,
  `review_notes` varchar(2000) DEFAULT NULL,
  `status` enum('DRAFT','ENROLLED','PENDING_REVIEW','REJECTED','UNDER_REVIEW','VALIDATED') NOT NULL,
  `submitted_at` datetime(6) DEFAULT NULL,
  `academic_year_id` bigint NOT NULL,
  `cohort_id` bigint DEFAULT NULL,
  `program_id` bigint NOT NULL,
  `student_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_admission_application_number` (`application_number`),
  UNIQUE KEY `UKier6aqqfhd08arrb2qba0ofxq` (`student_id`),
  KEY `idx_admission_status` (`status`),
  KEY `idx_admission_email` (`email`),
  KEY `idx_admission_academic_year` (`academic_year_id`),
  KEY `idx_admission_program` (`program_id`),
  KEY `idx_admission_priority` (`priority`),
  KEY `fk_admission_cohort` (`cohort_id`),
  CONSTRAINT `fk_admission_academic_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`),
  CONSTRAINT `fk_admission_cohort` FOREIGN KEY (`cohort_id`) REFERENCES `cohorts` (`id`),
  CONSTRAINT `fk_admission_program` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`),
  CONSTRAINT `fk_admission_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
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

-- Dump completed on 2026-03-25 11:27:36
