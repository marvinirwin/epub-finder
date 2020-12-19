import {Document} from "./document.entity";
import {Column, OneToOne, PrimaryColumn, ViewColumn, ViewEntity} from "typeorm";
import {User} from "./user.entity";

@ViewEntity({
    expression: `
    SELECT 
        b.id,
        b.document_id,
        b.name,
        b.html,
        b.created_at,
        b.creator_id,
        b.global,
        b.deleted,
        b.filename
    FROM document b
    LEFT JOIN document document_max 
        ON document_max.created_at > b.created_at
        AND document_max.document_id = b.document_id
    WHERE document_max.id IS NULL
`
})
export class DocumentView  {
    @ViewColumn()
    id: string;

    @ViewColumn()
    document_id: string;

    @ViewColumn()
    name: string;

    @ViewColumn()
    html: string | null;

    @ViewColumn()
    filename: string | null;

    @ViewColumn()
    created_at: Date;

    @ViewColumn()
    @OneToOne(() => User, user => user.id)
    creator_id: number | undefined;

    @ViewColumn()
    global: boolean;

    @ViewColumn()
    deleted: boolean;
}