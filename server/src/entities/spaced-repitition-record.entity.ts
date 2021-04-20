import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'


export type SuperMemoGrade = 1 | 2 | 3 | 4 | 5;

@Entity()
export class SpacedRepitionEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string
    @Column()
    word: string
    @Column()
    timestamp: Date
    @Column()
    nextDueDate: Date
    @Column()
    interval: number
    @Column()
    repetition: number
    @Column()
    efactor: number
    @Column()
    grade: SuperMemoGrade;
    @Column()
    flashcard_type: string
    @Column()
    language_code: string

    @Column()
    creator_id: number;

    @CreateDateColumn()
    created_at: Date;
}
