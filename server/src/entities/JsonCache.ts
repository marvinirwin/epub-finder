import {Entity, Column, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class JsonCache {
    @PrimaryGeneratedColumn()
    id!: string;
    @Column()
    service!: string;
    @Column()
    key_hash!: string;
    @Column()
    value!: string;
    @Column()
    key!: string;
    /*
        service        varchar(255) null,
        `key`          text         not null,
        key_hash       varchar(255) null,
        value          json         not null
    */
}