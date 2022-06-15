import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Document {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({default: ""})
    language_code: string

    // Used for Groupwise Max
    @Column({ default: null })
    document_id: string | null

    @Column("text")
    name: string

    @Column({ default: null })
    filename: string | null

    @Column("text")
    hash: string

    @Column({ default: null })
    creator_id: number | null

    @Column()
    global: boolean

    @Column({ default: false, type: "bool" })
    for_testing = false

    @Column({ default: false, type: "bool"  })
    for_frequency = false

    @Column({ default: true, type: "bool"  })
    for_reading = true

    @Column({ default: false, type: "bool" })
    deleted = false

    @CreateDateColumn({type: "timestamp with time zone"})
    created_at: Date
}
export const documentRootId = (d: {
    document_id: string | null;
    id: string;
}) => {
    return d.document_id || d.id;
};
