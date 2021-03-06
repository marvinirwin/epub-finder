import {Column, OneToOne, PrimaryColumn, ViewColumn, ViewEntity} from "typeorm";
import {User} from "./user.entity";

@ViewEntity({
    expression: `
    SELECT 
        b.id,
        b.document_id,
        b.name,
        b.created_at,
        b.creator_id,
        b.global,
        b.deleted,
        b.filename,
        b.hash,
        b.for_testing,
        b.for_frequency,
        b.for_reading
    FROM document b
    LEFT JOIN document document_max 
        ON document_max.created_at > b.created_at
        AND COALESCE(document_max.document_id::text, document_max.id::text)
        = COALESCE(b.document_id::text, b.id::text)
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
    hash: string;

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

    @Column()
    for_testing: boolean;

    @Column()
    for_frequency: boolean;

    @Column()
    for_reading: boolean;
}
