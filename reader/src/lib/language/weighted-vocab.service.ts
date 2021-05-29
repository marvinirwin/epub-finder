import { combineLatest, Observable } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'
import { WordRecognitionProgressRepository } from '../schedule/word-recognition-progress.repository'
import { recordsLearnedAnyDay } from '../schedule/schedule-row'
import { KnownWordsRepository } from '../schedule/known-words.repository'

export class WeightedVocabService {
    weightedVocab$: Observable<Map<string, number>>

    constructor({
                    wordRecognitionProgressRepository,
        knownWordsRepository
                }: {
        wordRecognitionProgressRepository: WordRecognitionProgressRepository
        knownWordsRepository: KnownWordsRepository
    }) {
        this.weightedVocab$ = combineLatest([
            wordRecognitionProgressRepository.indexOfOrderedRecords$,
            knownWordsRepository.indexOfOrderedRecords$
        ])
            .pipe(
                map(([indexedWordRecognitionRecords, knownWordIndex]) => {
                    const recognitionRowEntries: [string, number][] = Object.values(indexedWordRecognitionRecords).map(
                        (recognitionRecords) => {
                            const lastRecord =
                                recognitionRecords[
                                recognitionRecords.length - 1
                                    ]
                            return [
                                lastRecord.word,
                                recordsLearnedAnyDay(recognitionRecords)
                                    ? 1
                                    : 0,
                            ]
                        },
                    );
                    const knownWordsEntries: [string, number][] = Object.entries(knownWordIndex)
                        .filter(([word, records]) => {
                            const lastRecord = records[records.length - 1];
                            return lastRecord.is_known;
                        })
                        .map(([word]) => [word, 1])
                    return new Map<string, number>(
                        [
                            ...recognitionRowEntries,
                            ...knownWordsEntries,
                        ],
                    )
                }),
                shareReplay(1),
            )
    }
}
