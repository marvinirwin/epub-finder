import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class KnownWord {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    language_code: string
    @Column()
    word: string;
    @CreateDateColumn({type: "timestamp with time zone"})
    created_at: Date;
    @Column({default: true})
    is_known: boolean;
    @Column()
    creator_id: number;
}
