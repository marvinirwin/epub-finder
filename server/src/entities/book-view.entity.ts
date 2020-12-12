import {Book} from "./book.entity";
import {Column, OneToOne, PrimaryColumn, ViewColumn, ViewEntity} from "typeorm";
import {User} from "./user.entity";

@ViewEntity({
    expression: `
    SELECT 
        b.id,
        b.book_id,
        b.name,
        b.html,
        b.created_at,
        b.creator_id,
        b.global
    FROM book b
    LEFT JOIN book book_max 
        ON book_max.created_at > b.created_at
        AND book_max.book_id = b.book_id
    WHERE book_max.id IS NULL
`
})
export class BookView  {
    @ViewColumn()
    id: number;

    @ViewColumn()
    book_id: number;

    @ViewColumn()
    name: string;

    @ViewColumn()
    html: string;

    @ViewColumn()
    created_at: Date;

    @ViewColumn()
    @OneToOne(() => User, user => user.id)
    creator_id: number;

    @ViewColumn()
    global: boolean;
}