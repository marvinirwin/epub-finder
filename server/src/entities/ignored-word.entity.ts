import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class IgnoredWord {
    @PrimaryGeneratedColumn('uuid')
    id: string
    @Column()
    language_code: string
    @Column()
    word: string;
    @CreateDateColumn()
    created_at: Date;

    @Column()
    creator_id: number;
}
