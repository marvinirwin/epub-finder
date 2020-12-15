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
export class Book {
    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column("text")
    name: string;

    @Column('text')
    html: string;

    @Column('text')
    html_hash: string;

    @Column({default: null})
    creator_id: number | null;

    @Column()
    global: boolean;

    // Used for Groupwise Max
    @Column()
    book_id: string;

    @Column()
    deleted: boolean = false;

    @CreateDateColumn()
    created_at: Date;
}
