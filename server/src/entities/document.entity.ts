import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Generated,
    PrimaryColumn,
    PrimaryGeneratedColumn
} from "typeorm";
import {DocumentClassifierEndpointArn} from "aws-sdk/clients/comprehend";

@Entity()
export class Document {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    // Used for Groupwise Max
    @Column({default: null})
    document_id: string | null;

    @Column("text")
    name: string;

    @Column({default: null})
    filename: string | null;

    @Column('text')
    hash: string;

    @Column({default: null})
    creator_id: number | null;

    @Column()
    global: boolean;

    @Column({default: false})
    for_testing: boolean = false;

    @Column({default: false})
    for_frequency: boolean = false;

    @Column({default: true})
    for_reading: boolean = true;

    @Column({default: false})
    deleted: boolean = false;

    @CreateDateColumn()
    created_at: Date;
}
export const documentRootId = (d: {document_id: string | null, id: string}) => {
    return d.document_id || d.id
}

