import {Observable} from "rxjs";
import {Dictionary} from "lodash";
import {ICard} from "../Interfaces/ICard";
import {map, withLatestFrom} from "rxjs/operators";
import {getNewICardForWord} from "../Util/Util";

export const resolveICardForWord = <T, U>(icardMap$: Observable<Dictionary<ICard[]>>) => (obs$: Observable<T>): Observable<U> =>
    obs$.pipe(
        withLatestFrom(icardMap$),
        map(([word, cardIndex]: [T, Dictionary<ICard[]>]) => {
            if (word) {
                // @ts-ignore
                return cardIndex[word]?.length ? cardIndex[word][0] : getNewICardForWord(word, '')
            }
            return undefined;
        })
    );