import {Column, CreateDateColumn, Entity, Generated, PrimaryColumn} from "typeorm";

@Entity()
export class Book {
    @PrimaryColumn()
    id: number;

    // Used for Groupwise Max
    @Column()
    @Generated("uuid")
    book_id: number;

    @Column("text")
    name: string;

    @Column('text')
    html: string;

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    created_at: Date;

    @Column()
    creator_id: number;

    @Column()
    global: boolean;
}
