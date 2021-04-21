import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Card {
    @PrimaryGeneratedColumn('uuid')
    id: string
    @Column()
    learning_language: string
    @Column()
    language_code: string
    @Column({type: 'jsonb'})
    photos: string[]
    @Column({type: 'jsonb'})
    sounds: string[]
    @Column({type: 'jsonb'})
    fields: string[]
    @CreateDateColumn()
    created_at: Date;
    @Column()
    creator_id: number;
}