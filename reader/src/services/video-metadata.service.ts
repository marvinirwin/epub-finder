import {Observable, of, ReplaySubject} from "rxjs";
import {ds_Dict} from "../lib/Tree/DeltaScanner";
import {distinctUntilChanged, map, shareReplay, switchMap, tap} from "rxjs/operators";
import {fetchBulkMetadata, fetchVideoMetadata} from "./video.service";
import {fromPromise} from "rxjs/internal-compatibility";
import {VideoMetadata} from "../types/";

export interface SentenceMetadata {
    name: string;
    metadata$: Observable<VideoMetadata | undefined>
}

export class VideoMetadataService {
    private metadataListeners: { [sentence: string]: ReplaySubject<VideoMetadata> } = {};
    public allSentences$: Observable<string[]>;
    allSentenceMetadata$: Observable<{ sentence: string; metadata$: ReplaySubject<VideoMetadata>; }[]>;

    constructor({allSentences$}: {
        allSentences$: Observable<Set<string>>
    }) {
        this.allSentences$ = allSentences$.pipe(
            map(allSentences => Array.from(allSentences)),
            distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
        );
        this.allSentences$.pipe(
        ).subscribe(async sentences => {
            const allMetadata = await fetchBulkMetadata(sentences);
            if (allMetadata) {
                Object.entries(allMetadata).forEach(([sentence, metadata]) => {
                    this.resolveMetadataListener$(sentence).next(metadata);
                })
            }
        });
        this.allSentenceMetadata$ = this.allSentences$.pipe(
            map(allSentences => allSentences.map(sentence => ({
                        sentence,
                        metadata$: this.resolveMetadataListener$(sentence)
                    }
                ))
            )
        )
    }

    public resolveMetadataListener$(sentence: string) {
        if (!this.metadataListeners[sentence]) {
            this.metadataListeners[sentence] = new ReplaySubject<VideoMetadata>(1);
        }
        return this.metadataListeners[sentence];
    }
}