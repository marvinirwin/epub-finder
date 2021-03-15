import CardsRepository from "./manager/cards.repository";
import {AllWordsRepository} from "./all-words.repository";
import {combineLatest, Observable} from "rxjs";
import {SetWithUniqueLengths} from "../../../server/src/shared/tabulate-documents/set-with-unique-lengths";
import {map, shareReplay} from "rxjs/operators";

export class WordsService {
    words$: Observable<SetWithUniqueLengths>;

    constructor(
        {
            cardsRepository,
            allWordsRepository
        }:
            {
                cardsRepository: CardsRepository,
                allWordsRepository: AllWordsRepository
            }
    ) {
        this.words$ = combineLatest([
            cardsRepository.all$,
            allWordsRepository.all$
        ]).pipe(
            map(([cards, words]) => {
                return new SetWithUniqueLengths(
                        [
                            ...Object.keys(cards),
                            ...words.values()
                        ]
                    );
                }
            ),
            shareReplay(1)
        )
    }
}