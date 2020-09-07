create DATABASE IF NOT EXISTS root;
USE root;
ALTER DATABASE root CHARACTER SET utf8 COLLATE utf8_general_ci;
create table json_cache
(
    cache_entry_id bigint auto_increment primary key,
    service        varchar(255) null,
    `key`          text         not null,
    key_hash       varchar(255) null,
    value          json         not null
);
create index key_service on json_cache (service, key_hash);


create table article
(
    article_id   bigint auto_increment
        primary key,
    article_name varchar(512) charset utf8mb4 null,
    text_content longtext                     not null,
    constraint article_name
        unique (article_name)
);

create table article_element
(
    article_element_id bigint auto_increment
        primary key,
    article_id         bigint                       not null,
    tag                varchar(255) charset utf8mb4 null,
    parent_id          bigint                       null,
    text_content       text                     not null
);

ALTER TABLE article_element CHARACTER SET utf8 COLLATE utf8_general_ci;

create table if not exists word_popularity
(
    word_popularity_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    lang VARCHAR(255) NOT NULL,
    word VARCHAR(255) charset utf8mb4 not null,
    count BIGINT NOT NULL,
    percentile DOUBLE NOT NULL
);

