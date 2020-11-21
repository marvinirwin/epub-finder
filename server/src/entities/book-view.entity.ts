import {BookEntity} from "./book.entity";
import {Column, PrimaryColumn, ViewColumn, ViewEntity} from "typeorm";

@ViewEntity({
    expression: `
    SELECT 
        b.id,
        b.bookId,
        b.name,
        b.html,
        b.createdAt,
        b.creatorId,
        b.global
    FROM book b
    LEFT JOIN book book_max 
        ON book_max.created_at > b.created_at
        AND book_max.book_id = b.book_id
    WHERE book_max.id IS NULL
`
})
export class BookViewEntity  {
    @ViewColumn()
    id: number;

    @ViewColumn()
    bookId: number;

    @ViewColumn()
    name: string;

    @ViewColumn()
    html: string;

    @ViewColumn()
    createdAt: Date;

    @ViewColumn()
    creatorId: number;

    @ViewColumn()
    global: boolean;
}