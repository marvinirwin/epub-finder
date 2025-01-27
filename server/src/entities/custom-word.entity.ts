import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CustomWord {
    @PrimaryGeneratedColumn()
    id: number | null
    @Column()
    language_code: string
    @Column()
    word: string;
    @CreateDateColumn({type: "timestamp with time zone"})
    created_at: Date;
    @Column()
    creator_id: number;
}
