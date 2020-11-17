import {ds_Dict} from "../lib/Tree/DeltaScanner";
import {AtomizedSentence} from "../lib/Atomized/AtomizedSentence";
import {combineLatest, Observable} from "rxjs";
import {Modes, ModesService} from "../lib/Modes/modes.service";
import {VideoMetadataService} from "./video-metadata.service";

export class SentenceVideoHighlightService {
    constructor({
                    visibleAtomizedSentences$,
                    modesService,
                    videoMetadataService
                }: {
        visibleAtomizedSentences$: Observable<ds_Dict<AtomizedSentence[]>>,
        modesService: ModesService,
        videoMetadataService: VideoMetadataService
    }) {
        let previousHighlightedSentences: ds_Dict<AtomizedSentence[]> = {};
        combineLatest([
            modesService.mode$,
            visibleAtomizedSentences$,
            videoMetadataService.sentenceMetadata$
        ]).subscribe(([mode, visibleAtomizedSentences, sentenceMetadata]) => {
            previousHighlightedSentences = visibleAtomizedSentences;
            const iterateAtomizedSentences = (s: ds_Dict<AtomizedSentence[]>, func: (atomizedSentence: AtomizedSentence) => void) => {
                Object.values(s)
                    .forEach(atomizedSentences => atomizedSentences
                        .forEach(func)
                    )
            }
            switch (mode) {
                case Modes.VIDEO:
                    iterateAtomizedSentences(visibleAtomizedSentences, atomizedSentence =>
                        atomizedSentence.getSentenceHTMLElement().classList.add(
                            sentenceMetadata[atomizedSentence.translatableText]?.metadata ?
                                'has-metadata' :
                                'no-metadata'
                        ));
                    break;
                default:
                    iterateAtomizedSentences(previousHighlightedSentences, atomizedSentence =>
                        atomizedSentence.getSentenceHTMLElement() .classList.remove('has-metadata', 'no-metadata'))
                    break;
            }
        })
    }
}