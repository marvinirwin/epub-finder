import {Column, CreateDateColumn, Entity, Generated, PrimaryColumn} from "typeorm";

@Entity()
export class VideoMetadataEntity {
    @PrimaryColumn()
    id: number;

    // Used in groupwise max
    @Generated("uuid")
    videoMetadataId: number;

    @Column("text")
    sentence: string;

    @Column("text")
    sentenceHash: string;

    @Column("text")
    metadata: string;

    @Column({type: "datetime", default: () => "CURRENT_TIMESTAMP"})
    createdAt: Date;
}