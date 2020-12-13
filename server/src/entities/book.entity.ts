import {Column, CreateDateColumn, Entity, Generated, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Book {
    @PrimaryGeneratedColumn()
    id: number;

    // Used for Groupwise Max
    @Column()
    @Generated("uuid")
    book_id: number;

    @Column("text")
    name: string;

    @Column('text')
    html: string;

    @Column('text')
    html_hash: string;

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    created_at: Date;

    @Column({default: null})
    creator_id: number | null;

    @Column()
    global: boolean;
}
