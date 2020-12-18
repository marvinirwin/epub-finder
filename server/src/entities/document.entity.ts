import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Generated,
    PrimaryColumn,
    PrimaryGeneratedColumn
} from "typeorm";

@Entity()
export class Document {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("text")
    name: string;

    @Column('text', {default: null})
    html: string | null;

    @Column('text')
    html_hash: string;

    @Column()
    filename: string | null;

    @Column({default: null})
    creator_id: number | null;

    @Column()
    global: boolean;

    // Used for Groupwise Max
    @Column({default: null})
    document_id: string | null;

    @Column({default: null})
    deleted: boolean | null = false;

    @CreateDateColumn()
    created_at: Date;
}
