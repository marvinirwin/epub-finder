import { Observable } from 'rxjs'
import { Dictionary } from 'lodash'
import { ICard } from '../../../../server/src/shared/ICard'
import { map, withLatestFrom } from 'rxjs/operators'
import { cardForWord } from '../util/Util'

export const resolveICardForWords = (
    icardMap$: Observable<Dictionary<ICard[]>>,
    readingLanguageCode$: Observable<string>
) => (obs$: Observable<string[]>): Observable<ICard[]> =>
    obs$.pipe(
        withLatestFrom(icardMap$, readingLanguageCode$),
        map(([words, cardIndex, readingLanguageCode]) => {
            return words.map((word) =>
                cardIndex[word]?.length
                    ? cardIndex[word][0]
                    : cardForWord(word, readingLanguageCode),
            )
        }),
    )
