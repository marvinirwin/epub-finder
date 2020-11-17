import {Observable, of} from "rxjs";
import {ds_Dict} from "../lib/Tree/DeltaScanner";
import {map, tap} from "rxjs/operators";
import {VideoMetaData} from "../components/PronunciationVideo/video-meta-data.interface";
import {fetchVideoMetadata} from "./video.service";
import {fromPromise} from "rxjs/internal-compatibility";

export interface SentenceMetadata {
    name: string;
    metadata$: Observable<VideoMetaData | undefined>
    metadata: VideoMetaData | undefined;
}

export class VideoMetadataService {
    public sentenceMetadata$: Observable<ds_Dict<SentenceMetadata>>
    private cachedMetadata: ds_Dict<VideoMetaData> = {};

    constructor({allSentences$}: {
        allSentences$: Observable<Set<string>>
    }) {
        this.sentenceMetadata$ = allSentences$.pipe(map(sentences => {
            const metadata: ds_Dict<SentenceMetadata> = {};
            sentences.forEach(sentence => {
                metadata[sentence] = this.getSentenceMetadata(sentence)
            });
            return metadata;
        }))
    }

    private getSentenceMetadata(sentence: string): SentenceMetadata {
        const metadata: Partial<SentenceMetadata> = {
            name: sentence,
            metadata: undefined
        };
        metadata.metadata$ = this.cachedMetadata[sentence] ?
            of(this.cachedMetadata[sentence]).pipe(
                tap(videoMetadata => {
                    metadata.metadata = videoMetadata
                    if (videoMetadata) {
                        this.cachedMetadata[sentence] = videoMetadata;
                    }
                })
            ) : fromPromise(fetchVideoMetadata(sentence));

        return metadata as SentenceMetadata;
    }
}