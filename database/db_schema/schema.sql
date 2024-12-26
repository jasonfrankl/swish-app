-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: kanboard
-- ------------------------------------------------------
-- Server version	5.5.5-10.6.20-MariaDB-ubu2004

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
-- Disable foreign key checks to avoid constraint errors
SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables if they exist (order matters for dependencies)
DROP TABLE IF EXISTS board_users;
DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS task;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS board;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS games;

-- Re-enable foreign key checks after table drops
SET FOREIGN_KEY_CHECKS = 1;


CREATE TABLE IF NOT EXISTS games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sport_type ENUM('college_basketball', 'womens_college_basketball', 'college_football') NOT NULL,
    team_one VARCHAR(100) NOT NULL,
    team_two VARCHAR(100) NOT NULL,
    game_date DATETIME NOT NULL,
    game_clock VARCHAR(20),
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample data insertion for testing
INSERT INTO games (sport_type, team_one, team_two, game_date, game_clock)
VALUES 
('college_basketball', 'Duke', 'UNC', '2024-03-15 19:00:00', '9:00'),
('womens_college_basketball', 'UConn', 'Stanford', '2024-03-12 17:30:00', '8:30'),
('college_football', 'Alabama', 'Georgia', '2024-09-05 15:00:00', '2:23');