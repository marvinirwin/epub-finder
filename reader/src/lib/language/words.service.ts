import CardsRepository from '../manager/cards.repository'
import { AllWordsRepository } from './all-words.repository'
import { combineLatest, Observable } from 'rxjs'
import { SetWithUniqueLengths } from '../../../../server/src/shared/tabulate-documents/set-with-unique-lengths'
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators'
import { CustomWordsRepository } from '../schedule/learning-target/custom-words.repository'

export class WordsService {
    words$: Observable<SetWithUniqueLengths>

    constructor({
        customWordsRepository,
        allWordsRepository,
    }: {
        customWordsRepository: CustomWordsRepository
        allWordsRepository: AllWordsRepository
    }) {
        this.words$ = combineLatest([
            customWordsRepository.indexOfOrderedRecords$,
            allWordsRepository.all$,
        ]).pipe(
            map(([customWordsIndex, words]) => {
                return new SetWithUniqueLengths([
                    ...Object.keys(customWordsIndex),
                    ...words.values(),
                ])
            }),
            shareReplay(1),
        )
    }
}
