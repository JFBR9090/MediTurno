-- MariaDB dump 10.19  Distrib 10.4.27-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: mediturno
-- ------------------------------------------------------
-- Server version	8.0.30

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `mediturno`
--

/*!40000 DROP DATABASE IF EXISTS `mediturno`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `mediturno` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `mediturno`;

--
-- Table structure for table `bloqueos_horario`
--

DROP TABLE IF EXISTS `bloqueos_horario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bloqueos_horario` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `medico_id` bigint unsigned NOT NULL,
  `fecha_hora_inicio` datetime NOT NULL,
  `fecha_hora_fin` datetime NOT NULL,
  `tipo` enum('descanso','vacaciones','incapacidad','administrativo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'descanso',
  `motivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_bloqueo_medico_rango` (`medico_id`,`fecha_hora_inicio`,`fecha_hora_fin`),
  CONSTRAINT `bloqueos_horario_medico_id_foreign` FOREIGN KEY (`medico_id`) REFERENCES `medicos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bloqueos_horario`
--

LOCK TABLES `bloqueos_horario` WRITE;
/*!40000 ALTER TABLE `bloqueos_horario` DISABLE KEYS */;
/*!40000 ALTER TABLE `bloqueos_horario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `citas`
--

DROP TABLE IF EXISTS `citas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `citas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `codigo_reserva` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `paciente_id` bigint unsigned NOT NULL,
  `medico_id` bigint unsigned NOT NULL,
  `especialidad_id` bigint unsigned NOT NULL,
  `fecha_hora_inicio` datetime NOT NULL,
  `fecha_hora_fin` datetime NOT NULL,
  `estado` enum('programada','confirmada','cancelada','completada','no_asistio') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'programada',
  `motivo_consulta` text COLLATE utf8mb4_unicode_ci,
  `motivo_cancelacion` text COLLATE utf8mb4_unicode_ci,
  `cancelado_por_user_id` bigint unsigned DEFAULT NULL,
  `cancelado_en` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `citas_codigo_reserva_unique` (`codigo_reserva`),
  KEY `citas_especialidad_id_foreign` (`especialidad_id`),
  KEY `citas_cancelado_por_user_id_foreign` (`cancelado_por_user_id`),
  KEY `idx_cita_disponibilidad` (`medico_id`,`fecha_hora_inicio`,`fecha_hora_fin`,`estado`),
  KEY `idx_cita_paciente` (`paciente_id`,`fecha_hora_inicio`),
  CONSTRAINT `citas_cancelado_por_user_id_foreign` FOREIGN KEY (`cancelado_por_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `citas_especialidad_id_foreign` FOREIGN KEY (`especialidad_id`) REFERENCES `especialidades` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `citas_medico_id_foreign` FOREIGN KEY (`medico_id`) REFERENCES `medicos` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `citas_paciente_id_foreign` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citas`
--

LOCK TABLES `citas` WRITE;
/*!40000 ALTER TABLE `citas` DISABLE KEYS */;
INSERT INTO `citas` VALUES (1,'MT-202611-4K9P',1,2,2,'2026-11-13 10:23:22','2026-11-13 10:53:22','confirmada','Control de chequeo general y lectura de laboratorio.',NULL,NULL,NULL,'2026-11-13 14:18:26','2026-11-13 14:18:26'),(2,'MT-202611-8B2T',1,1,1,'2026-11-16 10:00:00','2026-11-16 10:30:00','programada','Evaluación cardiovascular preventiva.',NULL,NULL,NULL,'2026-11-13 14:18:26','2026-11-13 14:18:26'),(3,'MT-202611-7M1X',1,4,4,'2026-11-17 14:30:00','2026-11-17 15:00:00','confirmada','Limpieza dental semestral y valoración.',NULL,NULL,NULL,'2026-11-13 14:18:26','2026-11-13 14:18:26'),(4,'MT-202610-2C5R',1,5,5,'2026-11-07 09:30:00','2026-11-07 10:00:00','completada','Revisión de lunares y prescripción de protector solar.',NULL,NULL,NULL,'2026-11-13 14:18:26','2026-11-13 14:18:26'),(5,'MT-202610-5D9L',1,8,8,'2026-11-01 15:00:00','2026-11-01 15:30:00','cancelada','Control anual de fórmula óptica.','Conflicto de horario laboral.',NULL,NULL,'2026-11-13 14:18:26','2026-11-13 14:18:26'),(6,'MT-202611-1H4N',2,1,1,'2026-11-13 08:30:00','2026-11-13 09:00:00','completada','Seguimiento de presión arterial y electrocardiograma.',NULL,NULL,NULL,'2026-11-13 14:18:26','2026-11-13 14:18:26'),(7,'MT-202611-3Q8V',3,1,1,'2026-11-13 10:30:00','2026-11-13 11:00:00','confirmada','Palpitaciones esporádicas y valoración física.',NULL,NULL,NULL,'2026-11-13 14:18:26','2026-11-13 14:18:26'),(8,'MT-202611-6Z2W',4,1,1,'2026-11-13 14:00:00','2026-11-13 14:30:00','programada','Primera consulta cardiológica por antecedente familiar.',NULL,NULL,NULL,'2026-11-13 14:18:26','2026-11-13 14:18:26'),(9,'MT-202611-9R5Y',5,1,1,'2026-11-13 15:00:00','2026-11-13 15:30:00','programada','Control semestral post-tratamiento.',NULL,NULL,NULL,'2026-11-13 14:18:26','2026-11-13 14:18:26'),(10,'MT-202611-2P7K',6,1,1,'2026-11-16 09:00:00','2026-11-16 09:30:00','confirmada','Control cardiológico.',NULL,NULL,NULL,'2026-11-13 14:18:26','2026-11-13 14:18:26'),(11,'MT-202611-QGKK',7,9,2,'2026-11-19 08:00:00','2026-11-19 08:30:00','no_asistio','Consulta médica general',NULL,NULL,NULL,'2026-11-13 15:16:45','2026-11-18 19:53:06'),(12,'MT-202611-SSPI',8,2,2,'2026-11-19 08:30:00','2026-11-19 09:00:00','programada','Consulta médica general',NULL,NULL,NULL,'2026-11-13 15:45:28','2026-11-13 15:45:28'),(13,'MT-202611-DSW6',9,1,1,'2026-11-24 08:00:00','2026-11-24 08:30:00','cancelada','Consulta médica general','Cancelada por el paciente',20,'2026-11-20 07:39:41','2026-11-20 12:39:08','2026-11-20 12:39:41');
/*!40000 ALTER TABLE `citas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `especialidades`
--

DROP TABLE IF EXISTS `especialidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `especialidades` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `icono` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Stethoscope',
  `tiempo_promedio_min` smallint unsigned NOT NULL DEFAULT '30',
  `activa` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `especialidades_nombre_unique` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `especialidades`
--

LOCK TABLES `especialidades` WRITE;
/*!40000 ALTER TABLE `especialidades` DISABLE KEYS */;
INSERT INTO `especialidades` VALUES (1,'Cardiología','Diagnóstico y prevención de enfermedades cardiovasculares.','HeartPulse',30,1,'2026-11-13 14:18:22','2026-11-13 14:18:22'),(2,'Medicina General','Atención primaria integral, control preventivo y valoración clínica.','Stethoscope',20,1,'2026-11-13 14:18:22','2026-11-13 14:18:22'),(3,'Pediatría','Cuidado médico especializado para recién nacidos, niños y adolescentes.','Baby',30,1,'2026-11-13 14:18:22','2026-11-13 14:18:22'),(4,'Odontología','Salud oral, profilaxis, endodoncia y odontología estética.','Smile',30,1,'2026-11-13 14:18:22','2026-11-13 14:18:22'),(5,'Dermatología','Evaluación clínica y tratamiento de afecciones de la piel.','Sparkles',30,1,'2026-11-13 14:18:22','2026-11-13 14:18:22'),(6,'Ginecología','Salud integral femenina, control prenatal y diagnóstico preventivo.','Activity',30,1,'2026-11-13 14:18:22','2026-11-13 14:18:22'),(7,'Ortopedia','Valoración osteomuscular, traumatología y rehabilitación articular.','Bone',30,1,'2026-11-13 14:18:22','2026-11-13 14:18:22'),(8,'Oftalmología','Examen visual completo, agudeza visual y salud ocular.','Eye',30,1,'2026-11-13 14:18:22','2026-11-13 14:18:22'),(9,'podologia','ola','Stethoscope',30,1,'2026-11-18 17:45:59','2026-11-20 12:27:37');
/*!40000 ALTER TABLE `especialidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_citas`
--

DROP TABLE IF EXISTS `historial_citas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `historial_citas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cita_id` bigint unsigned NOT NULL,
  `usuario_responsable_id` bigint unsigned NOT NULL,
  `estado_anterior` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_nuevo` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `observaciones` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registrado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `historial_citas_cita_id_foreign` (`cita_id`),
  KEY `historial_citas_usuario_responsable_id_foreign` (`usuario_responsable_id`),
  CONSTRAINT `historial_citas_cita_id_foreign` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historial_citas_usuario_responsable_id_foreign` FOREIGN KEY (`usuario_responsable_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_citas`
--

LOCK TABLES `historial_citas` WRITE;
/*!40000 ALTER TABLE `historial_citas` DISABLE KEYS */;
INSERT INTO `historial_citas` VALUES (1,1,12,NULL,'confirmada','Registro inicial de cita médica.','2026-11-13 14:18:26'),(2,2,12,NULL,'programada','Registro inicial de cita médica.','2026-11-13 14:18:26'),(3,3,12,NULL,'confirmada','Registro inicial de cita médica.','2026-11-13 14:18:26'),(4,4,12,NULL,'completada','Registro inicial de cita médica.','2026-11-13 14:18:26'),(5,5,12,NULL,'cancelada','Registro inicial de cita médica.','2026-11-13 14:18:26'),(6,6,13,NULL,'completada','Registro inicial de cita médica.','2026-11-13 14:18:26'),(7,7,14,NULL,'confirmada','Registro inicial de cita médica.','2026-11-13 14:18:26'),(8,8,15,NULL,'programada','Registro inicial de cita médica.','2026-11-13 14:18:26'),(9,9,16,NULL,'programada','Registro inicial de cita médica.','2026-11-13 14:18:26'),(10,10,17,NULL,'confirmada','Registro inicial de cita médica.','2026-11-13 14:18:26'),(11,11,18,NULL,'programada','Reserva creada (paciente).','2026-11-13 15:16:45'),(12,12,19,NULL,'programada','Reserva creada (paciente).','2026-11-13 15:45:28'),(13,11,11,'programada','no_asistio','Actualización médica a no_asistio.','2026-11-18 19:53:06'),(14,13,20,NULL,'programada','Reserva creada (paciente).','2026-11-20 12:39:08'),(15,13,20,'programada','cancelada','Cancelada por el paciente','2026-11-20 12:39:41');
/*!40000 ALTER TABLE `historial_citas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `horarios_atencion`
--

DROP TABLE IF EXISTS `horarios_atencion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `horarios_atencion` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `medico_id` bigint unsigned NOT NULL,
  `dia_semana` tinyint unsigned NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `horarios_atencion_medico_id_dia_semana_activo_index` (`medico_id`,`dia_semana`,`activo`),
  CONSTRAINT `horarios_atencion_medico_id_foreign` FOREIGN KEY (`medico_id`) REFERENCES `medicos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horarios_atencion`
--

LOCK TABLES `horarios_atencion` WRITE;
/*!40000 ALTER TABLE `horarios_atencion` DISABLE KEYS */;
INSERT INTO `horarios_atencion` VALUES (1,1,1,'08:00:00','12:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(2,1,1,'14:00:00','16:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(3,1,2,'08:00:00','12:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(4,1,2,'14:00:00','16:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(5,1,3,'08:00:00','12:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(6,1,3,'14:00:00','16:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(7,1,4,'08:00:00','12:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(8,1,4,'14:00:00','16:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(9,1,5,'08:00:00','12:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(10,1,5,'14:00:00','16:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(11,2,1,'08:00:00','12:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(12,2,1,'14:00:00','16:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(13,2,2,'08:00:00','12:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(14,2,2,'14:00:00','16:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(15,2,3,'08:00:00','12:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(16,2,3,'14:00:00','16:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(17,2,4,'08:00:00','12:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(18,2,4,'14:00:00','16:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(19,2,5,'08:00:00','12:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(20,2,5,'14:00:00','16:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(21,2,6,'08:00:00','12:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(22,2,6,'14:00:00','16:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(23,3,1,'08:00:00','12:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(24,3,1,'14:00:00','16:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(25,3,2,'08:00:00','12:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(26,3,2,'14:00:00','16:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(27,3,3,'08:00:00','12:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(28,3,3,'14:00:00','16:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(29,3,4,'08:00:00','12:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(30,3,4,'14:00:00','16:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(31,3,5,'08:00:00','12:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(32,3,5,'14:00:00','16:00:00',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(33,4,1,'08:00:00','12:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(34,4,1,'14:00:00','16:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(35,4,2,'08:00:00','12:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(36,4,2,'14:00:00','16:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(37,4,3,'08:00:00','12:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(38,4,3,'14:00:00','16:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(39,4,4,'08:00:00','12:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(40,4,4,'14:00:00','16:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(41,4,5,'08:00:00','12:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(42,4,5,'14:00:00','16:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(43,4,6,'08:00:00','12:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(44,4,6,'14:00:00','16:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(45,5,1,'08:00:00','12:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(46,5,1,'14:00:00','16:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(47,5,3,'08:00:00','12:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(48,5,3,'14:00:00','16:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(49,5,4,'08:00:00','12:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(50,5,4,'14:00:00','16:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(51,5,5,'08:00:00','12:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(52,5,5,'14:00:00','16:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(53,6,1,'08:00:00','12:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(54,6,1,'14:00:00','16:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(55,6,2,'08:00:00','12:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(56,6,2,'14:00:00','16:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(57,6,4,'08:00:00','12:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(58,6,4,'14:00:00','16:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(59,6,5,'08:00:00','12:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(60,6,5,'14:00:00','16:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(61,7,2,'08:00:00','12:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(62,7,2,'14:00:00','16:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(63,7,3,'08:00:00','12:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(64,7,3,'14:00:00','16:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(65,7,4,'08:00:00','12:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(66,7,4,'14:00:00','16:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(67,7,5,'08:00:00','12:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(68,7,5,'14:00:00','16:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(69,8,1,'08:00:00','12:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(70,8,1,'14:00:00','16:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(71,8,2,'08:00:00','12:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(72,8,2,'14:00:00','16:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(73,8,3,'08:00:00','12:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(74,8,3,'14:00:00','16:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(75,8,5,'08:00:00','12:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(76,8,5,'14:00:00','16:00:00',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(77,9,1,'08:00:00','12:00:00',1,'2026-11-13 14:18:25','2026-11-13 14:18:25'),(78,9,1,'14:00:00','16:00:00',1,'2026-11-13 14:18:25','2026-11-13 14:18:25'),(79,9,2,'08:00:00','12:00:00',1,'2026-11-13 14:18:25','2026-11-13 14:18:25'),(80,9,2,'14:00:00','16:00:00',1,'2026-11-13 14:18:25','2026-11-13 14:18:25'),(81,9,3,'08:00:00','12:00:00',1,'2026-11-13 14:18:25','2026-11-13 14:18:25'),(82,9,3,'14:00:00','16:00:00',1,'2026-11-13 14:18:25','2026-11-13 14:18:25'),(83,9,4,'08:00:00','12:00:00',1,'2026-11-13 14:18:25','2026-11-13 14:18:25'),(84,9,4,'14:00:00','16:00:00',1,'2026-11-13 14:18:25','2026-11-13 14:18:25'),(85,9,5,'08:00:00','12:00:00',1,'2026-11-13 14:18:25','2026-11-13 14:18:25'),(86,9,5,'14:00:00','16:00:00',1,'2026-11-13 14:18:25','2026-11-13 14:18:25'),(87,9,6,'08:00:00','12:00:00',1,'2026-11-13 14:18:25','2026-11-13 14:18:25'),(88,9,6,'14:00:00','16:00:00',1,'2026-11-13 14:18:25','2026-11-13 14:18:25');
/*!40000 ALTER TABLE `horarios_atencion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicos`
--

DROP TABLE IF EXISTS `medicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `medicos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `especialidad_id` bigint unsigned NOT NULL,
  `tarjeta_profesional` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `consultorio` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `biografia` text COLLATE utf8mb4_unicode_ci,
  `duracion_cita_defecto_min` smallint unsigned NOT NULL DEFAULT '30',
  `calificacion` decimal(3,1) NOT NULL DEFAULT '5.0',
  `iniciales` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MD',
  `color_avatar` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'bg-sky-100 text-sky-700',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `medicos_user_id_unique` (`user_id`),
  UNIQUE KEY `medicos_tarjeta_profesional_unique` (`tarjeta_profesional`),
  KEY `medicos_especialidad_id_foreign` (`especialidad_id`),
  CONSTRAINT `medicos_especialidad_id_foreign` FOREIGN KEY (`especialidad_id`) REFERENCES `especialidades` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `medicos_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicos`
--

LOCK TABLES `medicos` WRITE;
/*!40000 ALTER TABLE `medicos` DISABLE KEYS */;
INSERT INTO `medicos` VALUES (1,3,1,'TP-89412-CO','Consultorio 302 - Centro Médico MediTurno','Cardiólogo clínico con 12 años de experiencia en prevención cardiovascular e hipertensión.',30,4.9,'AM','bg-sky-100 text-sky-700',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(2,4,2,'TP-74520-CO','Consultorio 104 - Piso 1','Médica cirujana enfocada en medicina familiar, tamizaje preventivo y seguimiento crónico.',30,4.8,'SM','bg-emerald-100 text-emerald-700',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(3,5,3,'TP-61209-CO','Consultorio 205 - Ala Pediátrica','Pediatra puericultor especializado en desarrollo infantil y esquema integral de vacunación.',30,5.0,'MV','bg-indigo-100 text-indigo-700',1,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(4,6,4,'TP-55831-CO','Consultorio 210 - Unidad Oral','Odontóloga general y rehabilitadora oral con énfasis en atención mínimamente invasiva.',30,4.9,'VG','bg-teal-100 text-teal-700',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(5,7,5,'TP-90341-CO','Consultorio 401 - Piso 4','Dermatóloga clínica experta en dermatoscopia digital y manejo de patologías cutáneas.',30,4.8,'LR','bg-amber-100 text-amber-700',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(6,8,6,'TP-68114-CO','Consultorio 308 - Piso 3','Ginecólogo y obstetra dedicado al cuidado integral de la salud de la mujer.',30,4.9,'NH','bg-rose-100 text-rose-700',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(7,9,7,'TP-49201-CO','Consultorio 112 - Piso 1','Ortopedista y traumatólogo con enfoque en medicina deportiva y lesiones de rodilla.',30,4.7,'EC','bg-sky-100 text-sky-700',1,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(8,10,8,'TP-83710-CO','Consultorio 406 - Piso 4','Oftalmóloga clínica especializada en diagnóstico de segmento anterior y optometría médica.',30,4.9,'JP','bg-cyan-100 text-cyan-700',0,'2026-11-13 14:18:24','2026-11-20 12:38:21'),(9,11,2,'TP-10023-CO','Consultorio 101 - Piso 1','Especialista en medicina preventiva, valoración primaria y seguimiento ambulatorio.',30,4.9,'RR','bg-emerald-100 text-emerald-700',1,'2026-11-13 14:18:25','2026-11-13 14:18:25');
/*!40000 ALTER TABLE `medicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_11_11_000001_add_mediturno_fields_to_users_table',1),(5,'2026_11_11_000002_create_especialidades_table',1),(6,'2026_11_11_000003_create_pacientes_table',1),(7,'2026_11_11_000004_create_medicos_table',1),(8,'2026_11_11_000005_create_agendas_tables',1),(9,'2026_11_11_000006_create_citas_and_audit_tables',1),(10,'2026_11_13_084738_update_user_roles_add_perfiles',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notificaciones` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `cita_id` bigint unsigned DEFAULT NULL,
  `titulo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `leida` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notificaciones_user_id_foreign` (`user_id`),
  KEY `notificaciones_cita_id_foreign` (`cita_id`),
  CONSTRAINT `notificaciones_cita_id_foreign` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notificaciones_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
INSERT INTO `notificaciones` VALUES (1,12,NULL,'Cita confirmada','Tu cita de Medicina General (MT-202611-4K9P) está confirmada para hoy.',0,'2026-11-13 14:18:26','2026-11-13 14:18:26'),(2,12,NULL,'Recordatorio de asistencia','Recuerda llegar 15 minutos antes a tu consulta en el Consultorio 302.',0,'2026-11-13 14:18:26','2026-11-13 14:18:26'),(3,18,11,'Cita reservada','Cita MT-202611-QGKK con Dr. Roberto Ramírez programada.',0,'2026-11-13 15:16:45','2026-11-13 15:16:45'),(4,11,11,'Nueva cita asignada','El paciente Carlos Mendoza cuenta con el turno MT-202611-QGKK.',1,'2026-11-13 15:16:45','2026-11-13 15:46:18'),(5,19,12,'Cita reservada','Cita MT-202611-SSPI con Dra. Sofía Mendoza programada.',0,'2026-11-13 15:45:28','2026-11-13 15:45:28'),(6,4,12,'Nueva cita asignada','El paciente Mbappé Restrepo cuenta con el turno MT-202611-SSPI.',0,'2026-11-13 15:45:28','2026-11-13 15:45:28'),(7,18,11,'Cita Inasistencia','Tu turno MT-202611-QGKK fue actualizado a estado no_asistio.',0,'2026-11-18 19:53:06','2026-11-18 19:53:06'),(8,20,13,'Cita reservada','Cita MT-202611-DSW6 con Dr. Alejandro Martínez programada.',0,'2026-11-20 12:39:08','2026-11-20 12:39:08'),(9,3,13,'Nueva cita asignada','El paciente Mbappe Gutiérrez cuenta con el turno MT-202611-DSW6.',0,'2026-11-20 12:39:08','2026-11-20 12:39:08'),(10,20,13,'Cita cancelada','La cita MT-202611-DSW6 ha sido cancelada y su horario fue liberado.',0,'2026-11-20 12:39:41','2026-11-20 12:39:41');
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pacientes`
--

DROP TABLE IF EXISTS `pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pacientes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `tipo_documento` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CC',
  `numero_documento` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `direccion` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pacientes_user_id_unique` (`user_id`),
  UNIQUE KEY `pacientes_numero_documento_unique` (`numero_documento`),
  CONSTRAINT `pacientes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacientes`
--

LOCK TABLES `pacientes` WRITE;
/*!40000 ALTER TABLE `pacientes` DISABLE KEYS */;
INSERT INTO `pacientes` VALUES (1,12,'CC','1018456789','3001234567','1995-04-12',NULL,'2026-11-13 14:18:25','2026-11-13 14:18:25'),(2,13,'CC','79842105','3115678901','1988-09-23',NULL,'2026-11-13 14:18:25','2026-11-13 14:18:25'),(3,14,'CC','52410983','3158901234','1992-01-17',NULL,'2026-11-13 14:18:25','2026-11-13 14:18:25'),(4,15,'CC','80123491','3204456677','1985-06-05',NULL,'2026-11-13 14:18:25','2026-11-13 14:18:25'),(5,16,'CC','1032498112','3019987766','1999-11-30',NULL,'2026-11-13 14:18:26','2026-11-13 14:18:26'),(6,17,'CC','1020304050','3123456789','1990-03-14',NULL,'2026-11-13 14:18:26','2026-11-13 14:18:26'),(7,18,'CC','1029384756','3109876543','1992-07-15',NULL,'2026-11-13 14:18:26','2026-11-13 14:18:26'),(8,19,'CC','10859736','315894562','1999-01-24',NULL,'2026-11-13 15:44:49','2026-11-13 15:44:49'),(9,20,'CC','1078739765','3215050817','2026-06-20',NULL,'2026-11-20 11:53:21','2026-11-20 11:53:21'),(10,21,'TI','107879787','4654654654','2017-01-24',NULL,'2026-11-20 12:05:01','2026-11-20 12:05:01');
/*!40000 ALTER TABLE `pacientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('enEVai4V43HtTvzOe2uaQKGTxaEtLVLr1musGsBZ',NULL,'127.0.0.1','Symfony','YToyOntzOjY6Il90b2tlbiI7czo0MDoiNkRRaDVwb2t2czd6RUNMNGNQalVHdGNaQXBkUUc1WmlQamUzUDQzTSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1795178022),('KF34lQNgqSSUGk4G3ykMcE4pTGwvLt1pxnllaatW',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36','YToyOntzOjY6Il90b2tlbiI7czo0MDoiSFZNUmxFZkFaUmpHbkdicjc3UDhMVkNlbFg0R2QxMXBvVnpTakNXaSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1795183014);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `rol` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'paciente',
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'administrador','Juan Fernando','Salazar','Juan Fernando Salazar','admin@mediturno.co',NULL,'$2y$12$agStDRTMz2NcpxhHugRsdu6bXDdYD9KZ4fHkSM6RvCyPEIYpDjsEW',1,NULL,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(2,'administrador','Administrador','MediTurno','Administrador MediTurno','admin@mediturno.com',NULL,'$2y$12$KuASbeI7CtaUT7ThJPPU9OfDTloQJX6GWj.u0DcEEZWcdeqf8LSKK',1,NULL,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(3,'medico','Dr. Alejandro','Martínez','Dr. Alejandro Martínez','a.martinez@mediturno.co',NULL,'$2y$12$FZ1ceHhnWayCd5r2cvhHl.q7oHYeXaN1ElcgTFsA8wy9D/yqeMvf6',1,NULL,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(4,'medico','Dra. Sofía','Mendoza','Dra. Sofía Mendoza','s.mendoza@mediturno.co',NULL,'$2y$12$sGg0R5pdWVE48SKFXkenjeooDUNZaVNfi6ycF9vQwMnwPb4Xt6yQa',1,NULL,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(5,'medico','Dr. Mateo','Valencia','Dr. Mateo Valencia','m.valencia@mediturno.co',NULL,'$2y$12$EwUO01Ny3s8DntqPT0Hi2uxaJ8VtQqu1pTrh9PXQJGBTo7b4aWQLu',1,NULL,'2026-11-13 14:18:23','2026-11-13 14:18:23'),(6,'medico','Dra. Valeria','Gómez','Dra. Valeria Gómez','v.gomez@mediturno.co',NULL,'$2y$12$96t0VKJbjKS4olxGojbTnORWHTkSCkGW1S6v6XYk3JnRpP6fgEw8a',1,NULL,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(7,'medico','Dra. Laura','Ríos','Dra. Laura Ríos','l.rios@mediturno.co',NULL,'$2y$12$/rzb8M45GHAVqc2BtIFWfOKZ6urRLcAcadOBIytqfin9wLNqklodG',1,NULL,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(8,'medico','Dr. Nicolás','Herrera','Dr. Nicolás Herrera','n.herrera@mediturno.co',NULL,'$2y$12$TPrS/cj6AsoXNB9m70QXEOLxJy1u8J6RAqqGG6aeU5eeCgFesZrMG',1,NULL,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(9,'medico','Dr. Esteban','Cárdenas','Dr. Esteban Cárdenas','e.cardenas@mediturno.co',NULL,'$2y$12$2za8bqD8q6b5O57U5JkhsOdNTuGJW9eK7S4jh7g5v1v21Hvo2XUWa',1,NULL,'2026-11-13 14:18:24','2026-11-13 14:18:24'),(10,'medico','Dra. Juliana','Paredes','Dra. Juliana Paredes','j.paredes@mediturno.co',NULL,'$2y$12$ZPngAhSeClgpNo6Oi.PTeOuoi.Z2KbhKQMi.B3irWfHxPkhempVzy',0,NULL,'2026-11-13 14:18:24','2026-11-20 12:38:21'),(11,'medico','Dr. Roberto','Ramírez','Dr. Roberto Ramírez','dr.ramirez@mediturno.com',NULL,'$2y$12$9ykbdzFhWKApWjNZAJbtb.lreTMFYt3muQrShopj7nn30NZfQLFbm',1,NULL,'2026-11-13 14:18:25','2026-11-13 14:18:25'),(12,'paciente','Camila','Restrepo','Camila Restrepo','camila.restrepo@correo.co',NULL,'$2y$12$7Z/sjRq31Nx2uDK96RJJ.O6qJLMDSCXjbz/SlWdo8uVd6dGWLtzrK',1,NULL,'2026-11-13 14:18:25','2026-11-13 14:18:25'),(13,'paciente','Andrés Felipe','Mejía','Andrés Felipe Mejía','andres.mejia@correo.co',NULL,'$2y$12$VLABcX98IyABVsU4WsMQNer82IaUmOBFJ1GA3WaDOC8SbK2c8EWFO',1,NULL,'2026-11-13 14:18:25','2026-11-13 14:18:25'),(14,'paciente','Mariana','Ospina Ruiz','Mariana Ospina Ruiz','mariana.ospina@correo.co',NULL,'$2y$12$BRe4TC/1NPYZSvM2/bwlZ.NmvVPhdXVCGpBH/vpf9YSrgTFiOyuc6',1,NULL,'2026-11-13 14:18:25','2026-11-13 14:18:25'),(15,'paciente','Carlos Alberto','Torres','Carlos Alberto Torres','carlos.torres@correo.co',NULL,'$2y$12$k.//X1xgEUAdzGsZoUB4juzI.c68AMy0fWGGfxnVOK.1VbI/S5bcC',1,NULL,'2026-11-13 14:18:25','2026-11-13 14:18:25'),(16,'paciente','Luisa Fernanda','Vargas','Luisa Fernanda Vargas','luisa.vargas@correo.co',NULL,'$2y$12$NdrEuMTua94184USQQkPNOSCZf4RPcVHWdEdvpIQyskaZir6o7vSm',1,NULL,'2026-11-13 14:18:26','2026-11-13 14:18:26'),(17,'paciente','Santiago','Morales','Santiago Morales','santiago.morales@correo.co',NULL,'$2y$12$bYj314VRi0DsQnL2XqbF6eHTvwTL6bdQWVxDPP0VscglviCJj3hby',1,NULL,'2026-11-13 14:18:26','2026-11-13 14:18:26'),(18,'paciente','Carlos','Mendoza','Carlos Mendoza','carlos.mendoza@email.com',NULL,'$2y$12$x0rnkrkLr/iHYjtAlVc7TeRe4zHB24I91YvSwxPiOBEZPZ9MT8FtG',1,NULL,'2026-11-13 14:18:26','2026-11-13 14:18:26'),(19,'paciente','Mbappé','Restrepo','Mbappé Restrepo','mbappe@mediturno.com',NULL,'$2y$12$SKFPU9umvSdMua9bdm05Aee/n/PGEA7Eg.hl8dAq8XjIztwcr8gXC',1,NULL,'2026-11-13 15:44:49','2026-11-13 15:44:49'),(20,'paciente','Mbappe','Gutiérrez','Mbappe Gutiérrez','mbappe.restrepo@correo.com',NULL,'$2y$12$zssBlJfGalsVtuLAGkUeKeqMgCI6wenn3H51xQZQCqF4IfKjGeMn.',1,NULL,'2026-11-20 11:53:21','2026-11-20 11:53:21'),(21,'paciente','atreus','Jimenez','atreus Jimenez','atreus@email.com',NULL,'$2y$12$6pWD5Q8wDKU0FHyLIFibBO/MzmSikRmFLo0Uo8LRHv9MAJ0oUQFpC',1,NULL,'2026-11-20 12:05:01','2026-11-20 12:05:01');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'mediturno'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-20  9:38:45
