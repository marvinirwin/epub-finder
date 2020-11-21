import {Entity, Column, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class JsonCacheEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    service: string;
    @Column()
    key_hash: string;
    @Column("text")
    value: string;
    @Column()
    key: string;
}