CREATE DATABASE IF NOT EXISTS root;
USE root;
DROP TABLE IF EXISTS `json_cache`;
CREATE TABLE IF NOT EXISTS `json_cache` (
`cache_entry_id` BIGINT PRIMARY KEY AUTO_INCREMENT,
`service` VARCHAR(255),
`key` TEXT NOT NULL,
`key_hash` VARCHAR(255),
`value` JSON NOT NULL,
INDEX key_service (`service`, `key_hash`)
);
