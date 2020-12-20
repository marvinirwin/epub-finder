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

    // Used for Groupwise Max
    @Column({default: null})
    document_id: string | null;

    @Column("text")
    name: string;

    @Column('text', {default: null})
    html: string | null;

    @Column({default: null})
    filename: string | null;

    @Column('text', {default: null})
    hash: string | null;

    @Column({default: null})
    creator_id: number | null;

    @Column()
    global: boolean;

    @Column({default: false})
    deleted: boolean = false;

    @CreateDateColumn()
    created_at: Date;
}
