DROP DATABASE IF EXISTS root;
CREATE DATABASE IF NOT EXISTS root
CHARACTER SET utf8
COLLATE utf8_general_ci;
USE root;
DROP TABLE IF EXISTS `json_cache`;
CREATE TABLE IF NOT EXISTS `json_cache` (
`service` VARCHAR(255) PRIMARY KEY,
`key` TEXT NOT NULL,
`key_hash` VARCHAR(255),
`value` JSON NOT NULL,
INDEX key_service (`service`, `key_hash`)
);
