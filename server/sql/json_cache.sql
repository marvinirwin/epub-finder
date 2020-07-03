DROP TABLE `json_cache`;
CREATE TABLE IF NOT EXISTS `json_cache` (
`service` VARCHAR(255) PRIMARY KEY,
`key` TEXT NOT NULL,
`key_hash` VARCHAR(,
`value` JSON NOT NULL,
INDEX key_service (`service`, `key`)
);
