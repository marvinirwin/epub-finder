import {Column, PrimaryGeneratedColumn} from "typeorm";

export class SimilarityEdge {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    known_document_id: string;

    @Column()
    unknown_document_id: string;
}