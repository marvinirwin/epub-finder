import {Observable, of, ReplaySubject} from "rxjs";
import {ds_Dict} from "../lib/Tree/DeltaScanner";
import {map, shareReplay, tap} from "rxjs/operators";
import {fetchVideoMetadata} from "./video.service";
import {fromPromise} from "rxjs/internal-compatibility";
import {VideoMetadata} from "../types/";

/**
 * This is a terrible name an a terrible cache
 * TODO get rid of all of this
 */
export interface SentenceMetadata {
    name: string;
    metadata$: Observable<VideoMetadata | undefined>
    metadata: VideoMetadata | undefined;
}

export class VideoMetadataService {
    public sentenceMetadata$: Observable<ds_Dict<SentenceMetadata>>
    private cachedMetadata: ds_Dict<VideoMetadata> = {};


    constructor({allSentences$}: {
        allSentences$: Observable<Set<string>>
    }) {
        this.sentenceMetadata$ = allSentences$.pipe(
            map(sentences => {
                const metadata: ds_Dict<SentenceMetadata> = {};
                sentences.forEach(sentence => {
                    metadata[sentence] = this.getSentenceMetadata(sentence)
                });
                return metadata;
            }),
            shareReplay(1)
        )
    }

    private getSentenceMetadata(sentence: string): SentenceMetadata {
        const metadata: Partial<SentenceMetadata> = {
            name: sentence,
            metadata: undefined
        };
        const updateCacheTap = (o$: Observable<VideoMetadata | undefined>) => o$.pipe(
            tap(videoMetadata => {
                metadata.metadata = videoMetadata
                if (videoMetadata) {
                    this.cachedMetadata[sentence] = videoMetadata;
                }
            })
        )
        metadata.metadata$ = this.cachedMetadata[sentence] ?
            of(this.cachedMetadata[sentence]).pipe(
                shareReplay(1)
            ) : fromPromise(fetchVideoMetadata(sentence)).pipe(
                updateCacheTap,
                shareReplay(1)
            );

        return metadata as SentenceMetadata;
    }
}