import {Observable} from "rxjs";
import {Segment} from "../Atomized/segment";
import {ds_Dict} from "../Tree/DeltaScanner";
import {filter, map, take} from "rxjs/operators";
import {flatten, chunk} from "lodash";
import {TemporaryHighlightService} from "../Highlighting/temporary-highlight.service";

export class IntroHighlightService {
    constructor({atomizedSentences$, temporaryHighlightService}: {
        atomizedSentences$: Observable<ds_Dict<Segment[]>>,
        temporaryHighlightService: TemporaryHighlightService,
    }) {
        atomizedSentences$.pipe(
            map(atomizedSentences => flatten(Object.values(atomizedSentences))),
            filter(atomizedSentences => atomizedSentences.length >= 10),
            take(1)
        ).subscribe(async atomizedSentences => {
            const allSentences = atomizedSentences.slice(0, 10).map(atomizedSentence => atomizedSentence.translatableText);

            function getRandomWords() {
                return allSentences.map(sentence => sentence.slice(...randomRange(0, sentence.length, 3)));
            }

/*
            const randomWordChunks = chunk([...getRandomWords(), ...getRandomWords(), ...getRandomWords()], 3)
            for (let i = 0; i < randomWordChunks.length; i++) {
                const randomWords = randomWordChunks[i];
                randomWords.map(randomWord => temporaryHighlightService.highlightTemporaryWord(randomWord, RandomColorsService.randomColor(), 1000));
                await sleep(500);
            }
*/
        })
    }
}

const randomRange = (min: number, max: number, maxRangeSize: number): [number, number] => {
    const startRange = max - min;
    const start = (Math.random() * startRange) + min;
    const endRange = max - start;
    return [start, Math.min(Math.floor(start + (Math.random() * endRange) + 1), start + maxRangeSize)]
}
