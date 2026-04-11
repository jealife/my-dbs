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
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `archived` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `created_by` varchar(150) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(150) DEFAULT NULL,
  `address_line` varchar(255) DEFAULT NULL,
  `admission_date` date DEFAULT NULL,
  `admission_number` varchar(50) DEFAULT NULL,
  `city` varchar(120) DEFAULT NULL,
  `city_of_birth` varchar(120) DEFAULT NULL,
  `country` varchar(120) DEFAULT NULL,
  `country_of_birth` varchar(120) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `email` varchar(180) DEFAULT NULL,
  `enrollment_type` enum('EXCHANGE','NEW_ADMISSION','RE_ENROLLMENT','TRANSFER') NOT NULL,
  `expected_graduation_date` date DEFAULT NULL,
  `first_name` varchar(120) NOT NULL,
  `gender` varchar(30) DEFAULT NULL,
  `international_student` bit(1) NOT NULL,
  `last_name` varchar(120) NOT NULL,
  `medical_notes` varchar(2000) DEFAULT NULL,
  `middle_name` varchar(120) DEFAULT NULL,
  `national_id_number` varchar(100) DEFAULT NULL,
  `nationality` varchar(80) DEFAULT NULL,
  `passport_number` varchar(100) DEFAULT NULL,
  `phone_number` varchar(40) DEFAULT NULL,
  `photo_url` varchar(1000) DEFAULT NULL,
  `postal_code` varchar(30) DEFAULT NULL,
  `registration_date` date DEFAULT NULL,
  `registration_number` varchar(50) DEFAULT NULL,
  `scholarship_holder` bit(1) NOT NULL,
  `secondary_phone_number` varchar(40) DEFAULT NULL,
  `special_needs_notes` varchar(2000) DEFAULT NULL,
  `status` enum('ACTIVE','ADMITTED','APPLIED','ARCHIVED','DROPPED_OUT','GRADUATED','SUSPENDED') NOT NULL,
  `student_number` varchar(50) NOT NULL,
  `working_student` bit(1) NOT NULL,
  `academic_year_id` bigint NOT NULL,
  `class_id` bigint DEFAULT NULL,
  `cohort_id` bigint DEFAULT NULL,
  `program_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_students_student_number` (`student_number`),
  UNIQUE KEY `uk_students_user_id` (`user_id`),
  KEY `idx_students_status` (`status`),
  KEY `idx_students_program` (`program_id`),
  KEY `idx_students_class` (`class_id`),
  KEY `idx_students_cohort` (`cohort_id`),
  KEY `idx_students_year` (`academic_year_id`),
  CONSTRAINT `fk_student_academic_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`),
  CONSTRAINT `fk_student_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
  CONSTRAINT `fk_student_cohort` FOREIGN KEY (`cohort_id`) REFERENCES `cohorts` (`id`),
  CONSTRAINT `fk_student_program` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`),
  CONSTRAINT `fk_student_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-25 11:27:30
