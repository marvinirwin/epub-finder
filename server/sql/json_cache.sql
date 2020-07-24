CREATE DATABASE IF NOT EXISTS root;
USE root;
DROP TABLE IF EXISTS `json_cache`;
CREATE TABLE IF NOT EXISTS `json_cache`
(
    `cache_entry_id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `service`        VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
    `key`            TEXT NOT NULL,
    `key_hash`       VARCHAR(255),
    `value`          JSON NOT NULL,
    INDEX key_service (`service`, `key_hash`)
);

ALTER TABLE json_cache CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER DATABASE root CHARACTER SET utf8 COLLATE utf8_general_ci;



