import {Column, CreateDateColumn, Entity, Generated, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: 'video_metadata'})
export class VideoMetadata {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Used in groupwise max
    @Column()
    @Generated("uuid")
    video_metadata_id: string;

    @Column("text")
    sentence: string;

    @Column("text")
    sentence_hash: string;

    @Column("text")
    metadata: string;

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    created_at: Date;
}