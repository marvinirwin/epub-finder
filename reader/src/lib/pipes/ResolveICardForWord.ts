import { combineLatest, Observable } from 'rxjs'
import { Dictionary } from 'lodash'
import { ICard } from "@shared/"
import { map, shareReplay, withLatestFrom } from 'rxjs/operators'
import { cardForWord } from '../util/Util'

export const resolveICardForWord = <T, U>(
    icardMap$: Observable<Dictionary<ICard[]>>,
) => (obs$: Observable<T>): Observable<U> =>
    obs$.pipe(
        withLatestFrom(icardMap$),
        map(([word, cardIndex]: [T, Dictionary<ICard[]>]) => {
            if (word) {
                // @ts-ignore
                return cardIndex[word]?.length
                    // @ts-ignore
                    ? cardIndex[word][0]
                    // @ts-ignore
                    : cardForWord(word)
            }
            return undefined
        }),
    )
export const resolveICardForWordLatest = <T, U>(
    icardMap$: Observable<Dictionary<ICard[]>>,
    word$: Observable<string | undefined>,
    readingLanguageCode$: Observable<string>,
): Observable<ICard | undefined> =>
    combineLatest([icardMap$, word$, readingLanguageCode$]).pipe(
        map(([cardIndex, word, readingLanguageCode]) => {
            if (word) {
                return cardIndex[word]?.length
                    ? cardIndex[word][0]
                    : cardForWord(word, readingLanguageCode) as unknown as ICard
            }
            return undefined
        }),
        shareReplay(1),
    )