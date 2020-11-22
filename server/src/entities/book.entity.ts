import {Column, CreateDateColumn, Entity, Generated, PrimaryColumn} from "typeorm";

@Entity()
export class Book {
    @PrimaryColumn()
    id: number;

    // Used for Groupwise Max
    @Column()
    @Generated("uuid")
    bookId: number;

    @Column("text")
    name: string;

    @Column('text')
    html: string;

    @Column({type: "datetime", default: () => "CURRENT_TIMESTAMP"})
    createdAt: Date;

    @Column()
    creatorId: number;

    @Column()
    global: boolean;
}
