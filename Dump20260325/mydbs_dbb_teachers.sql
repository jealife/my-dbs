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
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `archived` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `created_by` varchar(150) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(150) DEFAULT NULL,
  `address_line` varchar(255) DEFAULT NULL,
  `bio` varchar(4000) DEFAULT NULL,
  `city` varchar(120) DEFAULT NULL,
  `country` varchar(120) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `email` varchar(180) DEFAULT NULL,
  `employee_number` varchar(50) DEFAULT NULL,
  `employment_type` enum('ADJUNCT','CONTRACT','FULL_TIME','PART_TIME','VISITING') NOT NULL,
  `end_contract_date` date DEFAULT NULL,
  `first_name` varchar(120) NOT NULL,
  `gender` varchar(30) DEFAULT NULL,
  `highest_degree` varchar(180) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `last_name` varchar(120) NOT NULL,
  `middle_name` varchar(120) DEFAULT NULL,
  `national_id_number` varchar(100) DEFAULT NULL,
  `nationality` varchar(80) DEFAULT NULL,
  `office_hours` varchar(500) DEFAULT NULL,
  `office_location` varchar(180) DEFAULT NULL,
  `passport_number` varchar(100) DEFAULT NULL,
  `phone_number` varchar(40) DEFAULT NULL,
  `photo_url` varchar(1000) DEFAULT NULL,
  `postal_code` varchar(30) DEFAULT NULL,
  `remote_available` bit(1) NOT NULL,
  `secondary_phone_number` varchar(40) DEFAULT NULL,
  `special_notes` varchar(2000) DEFAULT NULL,
  `status` enum('ACTIVE','ARCHIVED','INACTIVE','ON_LEAVE','PENDING','SUSPENDED') NOT NULL,
  `teacher_number` varchar(50) NOT NULL,
  `teaching_hours_quota` int DEFAULT NULL,
  `years_of_experience` int DEFAULT NULL,
  `academic_year_id` bigint NOT NULL,
  `class_id` bigint DEFAULT NULL,
  `program_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_teachers_teacher_number` (`teacher_number`),
  UNIQUE KEY `uk_teachers_user_id` (`user_id`),
  KEY `idx_teachers_status` (`status`),
  KEY `idx_teachers_program` (`program_id`),
  KEY `idx_teachers_class` (`class_id`),
  KEY `idx_teachers_year` (`academic_year_id`),
  CONSTRAINT `fk_teacher_academic_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`),
  CONSTRAINT `fk_teacher_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
  CONSTRAINT `fk_teacher_program` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`),
  CONSTRAINT `fk_teacher_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
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

-- Dump completed on 2026-03-25 11:27:26
