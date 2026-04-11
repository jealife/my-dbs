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
-- Table structure for table `managed_documents`
--

DROP TABLE IF EXISTS `managed_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `managed_documents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `archived` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `created_by` varchar(150) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(150) DEFAULT NULL,
  `academic_year_id` bigint DEFAULT NULL,
  `access_level` enum('ADMIN_ONLY','MANAGER','PUBLIC','STUDENT_ONLY','TEACHER') NOT NULL,
  `current_version_id` bigint DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `document_type` enum('ADMINISTRATIVE','ADMISSION_DOCUMENT','ASSIGNMENT_FILE','CERTIFICATE','COURSE_MATERIAL','DIPLOMA','ENROLLMENT_LETTER','INVOICE','JUSTIFICATION','OTHER','RECOMMENDATION','TRANSCRIPT') NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `owner_id` bigint DEFAULT NULL,
  `reference_id` bigint DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `tags` varchar(500) DEFAULT NULL,
  `title` varchar(300) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_doc_owner` (`owner_id`),
  KEY `idx_doc_type` (`document_type`),
  KEY `idx_doc_access` (`access_level`),
  KEY `idx_doc_ref_type` (`reference_type`),
  KEY `idx_doc_ref_id` (`reference_id`)
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
