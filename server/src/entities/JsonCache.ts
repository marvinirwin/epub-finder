import {Entity, Column, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class JsonCache {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    service: string;
    @Column()
    key_hash!: string;
    @Column()
    value: string;
    @Column()
    key!: string;
}