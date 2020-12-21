import {Column, CreateDateColumn, Entity, PrimaryColumn, ViewColumn, ViewEntity} from "typeorm";
import {VideoMetadata} from "./video.metadata";

@ViewEntity({
    expression: `
        SELECT 
            v.id,
            v.video_metadata_id,
            v.sentence,
            v.sentence_hash,
            v.metadata,
            v.created_at
        FROM video_metadata v
        LEFT JOIN video_metadata video_metadata_max 
            ON video_metadata_max.created_at > v.created_at AND 
            COALESCE(video_metadata_max.video_metadata_id::text, video_metadata_max.id::text) = 
            COALESCE(v.video_metadata_id::text, v.id::text)
        WHERE video_metadata_max.id IS NULL
    `
})
export class VideoMetadataView {
    @ViewColumn()
    id: string;

    // Used in groupwise max
    @ViewColumn()
    video_metadata_id: string | null;

    @ViewColumn()
    sentence: string;

    @ViewColumn()
    sentence_hash: string;

    @ViewColumn()
    metadata: string;

    @ViewColumn()
    created_at: Date;
}
