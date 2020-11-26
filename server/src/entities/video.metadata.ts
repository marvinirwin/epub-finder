import {Column, CreateDateColumn, Entity, Generated, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class VideoMetadataEntity {
    @PrimaryGeneratedColumn()
    id: number;

    // Used in groupwise max
    @Column()
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