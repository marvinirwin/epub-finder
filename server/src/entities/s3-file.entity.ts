import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm'

@Entity({ name: 's3_file' })
export class s3File {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    document_id: string

    @CreateDateColumn({type: "timestamp with time zone"})
    created_at: Date

    @Column()
    s3_key: string

    @Column()
    path: string
}
