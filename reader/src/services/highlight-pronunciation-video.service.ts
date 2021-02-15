import {HighlighterService} from "../lib/highlighting/highlighter.service";
import {PronunciationVideoService} from "../components/pronunciation-video/pronunciation-video.service";
import {distinctUntilChanged, map, shareReplay, withLatestFrom} from "rxjs/operators";
import {HighlightDelta} from "../lib/highlighting/highlight.interface";
import {WordMetadataMapService} from "./word-metadata-map.service";

export class HighlightPronunciationVideoService {
    constructor({
                    pronunciationVideoService,
                    highlighterService,
                    wordMetadataMapService
                }: {
                    pronunciationVideoService: PronunciationVideoService,
                    highlighterService: HighlighterService,
                    wordMetadataMapService: WordMetadataMapService
                }
    ) {

        const elementsToHighlight$ = pronunciationVideoService.videoPlaybackTime$.pipe(
            distinctUntilChanged(),
            withLatestFrom(pronunciationVideoService.videoMetadata$),
            map(([playbackTimeMs, metadata]) => {
                if (!metadata) {
                    return;
                }
                // TODO binary search
                return metadata.characters.findIndex(char => playbackTimeMs < (char.timestamp * metadata.timeScale))
            }),
            distinctUntilChanged(),
            withLatestFrom(wordMetadataMapService.visibleWordSegmentMap, pronunciationVideoService.videoMetadata$),
            map(([characterIndex, visibleSentences, videoMetadata]) => {
                if (characterIndex === -1 || !characterIndex || !videoMetadata) {
                    // Highlight nothing
                    return;
                }
                const delta: HighlightDelta = new Map();
                visibleSentences.get(videoMetadata.sentence)?.forEach(atomizedSentence => {
                        return delta.set(
                            atomizedSentence.element.childNodes[characterIndex] as unknown as HTMLElement,
                            [204, 255, 0, 1]
                        );
                    }
                )
                return delta;
            }),
            shareReplay(1)
        );
        highlighterService.singleHighlight(
            elementsToHighlight$,
            [0, 'PRONUNCIATION_VIDEO_HIGHLIGHT']
        )
    }
}