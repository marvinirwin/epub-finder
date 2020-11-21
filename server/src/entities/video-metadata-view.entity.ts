import {Column, CreateDateColumn, PrimaryColumn, ViewColumn, ViewEntity} from "typeorm";

@ViewEntity({
    expression: `
        SELECT 
            v.id,
            v.videoMetadataId,
            v.sentence,
            v.sentenceHash,
            v.metadata,
            v.createdAt
        FROM video_metadata v
        LEFT JOIN video_metadata  video_metadata_max 
            ON video_metadata_max.created_at > v.created_at
            AND video_metadata_max.video_metadata_id = v.video_metadata_id 
        WHERE video_metadata_max.id IS NULL
    `
})
export class VideoMetadataViewEntity {
    @ViewColumn()
    id: number;

    // Used in groupwise max
    @ViewColumn()
    videoMetadataId: number;

    @ViewColumn()
    sentence: string;

    @ViewColumn()
    sentenceHash: string;

    @ViewColumn()
    metadata: string;

    @ViewColumn()
    createdAt: Date;
}