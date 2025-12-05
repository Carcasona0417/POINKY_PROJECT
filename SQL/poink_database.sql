/*
 Navicat Premium Dump SQL

 Source Server         : MySQL_Conn
 Source Server Type    : MySQL
 Source Server Version : 80044 (8.0.44)
 Source Host           : localhost:3306
 Source Schema         : poink_database

 Target Server Type    : MySQL
 Target Server Version : 80044 (8.0.44)
 File Encoding         : 65001

 Date: 05/12/2025 12:29:03
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for expenses
-- ----------------------------
DROP TABLE IF EXISTS `expenses`;
CREATE TABLE `expenses`  (
  `ExpID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UserID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PigID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `FarmID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `Date` date NOT NULL,
  `Amount` decimal(10, 2) NOT NULL,
  `Category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`ExpID`) USING BTREE,
  INDEX `fk_exp_user`(`UserID` ASC) USING BTREE,
  INDEX `fk_exp_pig`(`PigID` ASC) USING BTREE,
  INDEX `fk_exp_farm`(`FarmID` ASC) USING BTREE,
  CONSTRAINT `fk_exp_farm` FOREIGN KEY (`FarmID`) REFERENCES `farm` (`FarmID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_exp_pig` FOREIGN KEY (`PigID`) REFERENCES `pig` (`PigID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_exp_user` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for expenses_record
-- ----------------------------
DROP TABLE IF EXISTS `expenses_record`;
CREATE TABLE `expenses_record`  (
  `PigID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `FarmID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ExpID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Amount` decimal(10, 2) NOT NULL,
  `Date` date NOT NULL,
  `Category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`PigID`, `ExpID`) USING BTREE,
  INDEX `fk_exprec_exp`(`ExpID` ASC) USING BTREE,
  INDEX `fk_exprec_farm`(`FarmID` ASC) USING BTREE,
  CONSTRAINT `fk_exprec_exp` FOREIGN KEY (`ExpID`) REFERENCES `expenses` (`ExpID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_exprec_farm` FOREIGN KEY (`FarmID`) REFERENCES `farm` (`FarmID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_exprec_pig` FOREIGN KEY (`PigID`) REFERENCES `pig` (`PigID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for farm
-- ----------------------------
DROP TABLE IF EXISTS `farm`;
CREATE TABLE `farm`  (
  `FarmID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `FarmName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UserID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`FarmID`) USING BTREE,
  INDEX `fk_farm_user`(`UserID` ASC) USING BTREE,
  CONSTRAINT `fk_farm_user` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for pig
-- ----------------------------
DROP TABLE IF EXISTS `pig`;
CREATE TABLE `pig`  (
  `PigID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PigName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Breed` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `Gender` enum('Male','Female') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Date` date NOT NULL,
  `Age` int NULL DEFAULT NULL,
  `Weight` decimal(5, 2) NOT NULL,
  `PigType` enum('Piglet','Starter','Grower','Finisher') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PigStatus` enum('Growing','ToSale','Sold','Deceased') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'Growing',
  `FarmID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`PigID`) USING BTREE,
  INDEX `fk_pig_farm`(`FarmID` ASC) USING BTREE,
  CONSTRAINT `fk_pig_farm` FOREIGN KEY (`FarmID`) REFERENCES `farm` (`FarmID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for reminders
-- ----------------------------
DROP TABLE IF EXISTS `reminders`;
CREATE TABLE `reminders`  (
  `RemID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `UserID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PigID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `FarmID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `Date` date NOT NULL,
  `Task` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Notes` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`RemID`) USING BTREE,
  INDEX `fk_rem_user`(`UserID` ASC) USING BTREE,
  INDEX `fk_rem_pig`(`PigID` ASC) USING BTREE,
  CONSTRAINT `fk_rem_pig` FOREIGN KEY (`PigID`) REFERENCES `pig` (`PigID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rem_user` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `UserID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`UserID`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for vaccination_record
-- ----------------------------
DROP TABLE IF EXISTS `vaccination_record`;
CREATE TABLE `vaccination_record`  (
  `PigID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `RemID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Date` date NULL DEFAULT NULL,
  `DueDate` date NOT NULL,
  `Category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`PigID`, `RemID`) USING BTREE,
  INDEX `fk_vacrec_rem`(`RemID` ASC) USING BTREE,
  CONSTRAINT `fk_vacrec_pig` FOREIGN KEY (`PigID`) REFERENCES `pig` (`PigID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_vacrec_rem` FOREIGN KEY (`RemID`) REFERENCES `reminders` (`RemID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for weight_id_counter
-- ----------------------------
DROP TABLE IF EXISTS `weight_id_counter`;
CREATE TABLE `weight_id_counter`  (
  `counter_id` int NOT NULL DEFAULT 1,
  `next_id` int NULL DEFAULT 1,
  PRIMARY KEY (`counter_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for weight_records
-- ----------------------------
DROP TABLE IF EXISTS `weight_records`;
CREATE TABLE `weight_records`  (
  `WeightID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Date` date NOT NULL,
  `Weight` decimal(5, 2) NOT NULL,
  `PigID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PhotoPath` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`WeightID`) USING BTREE,
  UNIQUE INDEX `unique_pig_weight_date`(`PigID` ASC, `Date` ASC) USING BTREE,
  CONSTRAINT `fk_weightrec_pig` FOREIGN KEY (`PigID`) REFERENCES `pig` (`PigID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
