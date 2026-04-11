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
-- Table structure for table `evaluation_results`
--

DROP TABLE IF EXISTS `evaluation_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluation_results` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `archived` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `created_by` varchar(150) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(150) DEFAULT NULL,
  `is_compensated` bit(1) NOT NULL,
  `graded_at` datetime(6) DEFAULT NULL,
  `max_score` double NOT NULL,
  `score` double DEFAULT NULL,
  `status` enum('ABSENT','EXCUSED','GRADED','PENDING','PUBLISHED') NOT NULL,
  `teacher_comment` varchar(1000) DEFAULT NULL,
  `evaluation_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_eval_result_eval_student` (`evaluation_id`,`student_id`),
  KEY `idx_eval_result_evaluation` (`evaluation_id`),
  KEY `idx_eval_result_student` (`student_id`),
  KEY `idx_eval_result_status` (`status`),
  CONSTRAINT `fk_eval_result_evaluation` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations` (`id`),
  CONSTRAINT `fk_eval_result_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
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

-- Dump completed on 2026-03-25 11:27:32
