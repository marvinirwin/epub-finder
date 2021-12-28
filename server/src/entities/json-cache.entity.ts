import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity()
export class JsonCache {
    @PrimaryGeneratedColumn()
    id: number
    @Column()
    service: string
    @Column()
    key_hash: string
    @Column("text")
    value: string
    @Column("text", { default: "" })
    key: string
    @CreateDateColumn({default: new Date()})
    created_at: Date;
}
