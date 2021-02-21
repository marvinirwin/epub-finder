import {Column, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

export class SimilarityEdgeVersion {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    count_edge_id: string;


    @Column("text")
    similarity_result: string;
}
