import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'


export type SuperMemoGrade = 1 | 2 | 3 | 4 | 5;

@Entity()
export class SpacedRepitionEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string
    @Column()
    word: string
    @Column()
    nextDueDate: Date
    @Column({type: 'float'})
    interval: number
    @Column()
    repetition: number
    @Column({type: 'float'})
    efactor: number
    @Column()
    grade: SuperMemoGrade;
    @Column()
    flash_card_type: string
    @Column()
    language_code: string

    @Column()
    creator_id: number;

    @CreateDateColumn()
    created_at: Date;
}
