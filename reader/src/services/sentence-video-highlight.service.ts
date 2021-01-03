import {ds_Dict} from "../lib/Tree/DeltaScanner";
import {Segment} from "../lib/Atomized/segment";
import {combineLatest, Observable} from "rxjs";
import {Modes, ModesService} from "../lib/Modes/modes.service";
import {VideoMetadataService} from "./video-metadata.service";
import {debounceTime, map, shareReplay, switchMap, startWith, tap} from "rxjs/operators";
import {keyBy, Dictionary} from 'lodash';
import {AtomMetadata} from "../lib/Interfaces/atom-metadata.interface.ts/atom-metadata";

export class SentenceVideoHighlightService {
    constructor({
                    visibleAtomizedSentences$,
                    modesService,
                    videoMetadataService
                }: {
        visibleAtomizedSentences$: Observable<Map<string, Set<Segment>>>,
        modesService: ModesService,
        videoMetadataService: VideoMetadataService
    }) {
        let previousHighlightedSentences: Map<string, Set<Segment>> = new Map();
        combineLatest([
            modesService.mode$,
            visibleAtomizedSentences$,
            videoMetadataService.allSentenceMetadata$.pipe(
                switchMap(sentenceMetadata => {
                    let sources = Object.entries(sentenceMetadata).map(([sentence, {metadata$}]) => metadata$.pipe(startWith(undefined)));
                    debugger;
                    return combineLatest(
                            sources
                        )
                    }
                ),
                debounceTime(1000),
                shareReplay(1)
            )
        ]).subscribe(([mode, visibleAtomizedSentences, sentenceMetadataList]) => {
            const sentenceMetadata = keyBy(sentenceMetadataList, 'sentence')
            previousHighlightedSentences = visibleAtomizedSentences;
            const iterateAtomizedSentences = (s: Map<string, Set<Segment>>, func: (atomizedSentence: Segment) => void) => {
                s.forEach(segmentSet => segmentSet.forEach(func))
            }
            switch (mode) {
                case Modes.VIDEO:
                    iterateAtomizedSentences(visibleAtomizedSentences, atomizedSentence => {
                        atomizedSentence.getSentenceHTMLElement().classList.add(
                            sentenceMetadata[atomizedSentence.translatableText] ?
                                'has-metadata' :
                                'no-metadata'
                        );
                    });
                    break;
                default:
                    iterateAtomizedSentences(previousHighlightedSentences, atomizedSentence =>
                        atomizedSentence.getSentenceHTMLElement().classList.remove('has-metadata', 'no-metadata'))
                    break;
            }
        })
    }
}