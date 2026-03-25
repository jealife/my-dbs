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
-- Table structure for table `course_resources`
--

DROP TABLE IF EXISTS `course_resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_resources` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `archived` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `created_by` varchar(150) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(150) DEFAULT NULL,
  `content_type` varchar(150) DEFAULT NULL,
  `description` varchar(2000) DEFAULT NULL,
  `download_count` bigint NOT NULL,
  `expires_at` varchar(50) DEFAULT NULL,
  `external_url` varchar(1000) DEFAULT NULL,
  `file_extension` varchar(30) DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `media_category` enum('DOCUMENT','IMAGE','OTHER','VIDEO') NOT NULL,
  `original_file_name` varchar(255) DEFAULT NULL,
  `public_url` varchar(1000) DEFAULT NULL,
  `resource_type` enum('DOCUMENT','EXTERNAL_LINK','FILE','IMAGE','VIDEO','VIDEO_LINK') NOT NULL,
  `storage_path` varchar(1000) DEFAULT NULL,
  `stored_file_name` varchar(255) DEFAULT NULL,
  `title` varchar(180) NOT NULL,
  `visibility` enum('CLASS_ONLY','COURSE_ONLY','PRIVATE','PUBLIC') NOT NULL,
  `course_id` bigint NOT NULL,
  `course_module_id` bigint DEFAULT NULL,
  `lesson_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_course_resources_course` (`course_id`),
  KEY `idx_course_resources_module` (`course_module_id`),
  KEY `idx_course_resources_lesson` (`lesson_id`),
  KEY `idx_course_resources_category` (`media_category`),
  CONSTRAINT `fk_course_resource_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`),
  CONSTRAINT `fk_course_resource_module` FOREIGN KEY (`course_module_id`) REFERENCES `course_modules` (`id`)
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

-- Dump completed on 2026-03-25 11:27:25
