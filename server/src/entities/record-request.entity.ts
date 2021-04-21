import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
export class RecordRequest {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    creator_id: number

    @CreateDateColumn()
    created_at: Date

    @Column()
    sentence: string
}
