import {combineLatest, Observable} from "rxjs";
import {Dictionary} from "lodash";
import {ICard} from "../Interfaces/ICard";
import {map, withLatestFrom} from "rxjs/operators";
import {cardForWord} from "../Util/Util";

export const resolveICardForWord = <T, U>(icardMap$: Observable<Dictionary<ICard[]>>) => (obs$: Observable<T>): Observable<U> =>
    obs$.pipe(
        withLatestFrom(icardMap$),
        map(([word, cardIndex]: [T, Dictionary<ICard[]>]) => {
            if (word) {
                // @ts-ignore
                return cardIndex[word]?.length ? cardIndex[word][0] : cardForWord(word, '')
            }
            return undefined;
        })
    );
export const resolveICardForWordLatest= <T, U>(icardMap$: Observable<Dictionary<ICard[]>>, word$: Observable<string | undefined>): Observable<ICard | undefined> =>
    combineLatest([
        icardMap$,
        word$
    ]).pipe(map(([cardIndex, word]) => {
        if (word) {
            // @ts-ignore
            return cardIndex[word]?.length ? cardIndex[word][0] : cardForWord(word, '')
        }
        return undefined;
    }))
/*
    obs$.pipe(
        withLatestFrom(icardMap$),
        map(([word, cardIndex]: [T, Dictionary<ICard[]>]) => {
            if (word) {
                // @ts-ignore
                return cardIndex[word]?.length ? cardIndex[word][0] : cardForWord(word, '')
            }
            return undefined;
        })
    );*/
