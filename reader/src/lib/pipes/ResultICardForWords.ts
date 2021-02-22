import {Observable} from "rxjs";
import {Dictionary} from "lodash";
import {ICard} from "../../../../server/src/shared/ICard";
import {map, withLatestFrom} from "rxjs/operators";
import {cardForWord} from "../Util/Util";

export const resolveICardForWords = (icardMap$: Observable<Dictionary<ICard[]>>) => (obs$: Observable<string[]>): Observable<ICard[]> =>
    obs$.pipe(
        withLatestFrom(icardMap$),
        map(([words, cardIndex]: [string[], Dictionary<ICard[]>]) => {
            return words.map(word => cardIndex[word]?.length ? cardIndex[word][0] : cardForWord(word))
        })
    );