import {Observable, ReplaySubject, Subject} from "rxjs";
import {ICard, MyAppDatabase} from "./AppDB";
import {Dictionary} from "lodash";
import {reduce} from "rxjs/operators";

export class CardManager {
    addCard$: Subject<ICard[]> = new Subject<ICard[]>();
    currentCards$: ReplaySubject<ICard[]> = new ReplaySubject<ICard[]>(1);
    currentCardMap$: Observable<Dictionary<ICard[]>>;/* = new Subject<Dictionary<ICard>>()*/
    // TODO these much later when necessary
    currentPackage$: ReplaySubject<string> = new ReplaySubject<string>(1);
    currentDeck$: ReplaySubject<string> = new ReplaySubject<string>(1);
    currentCollection$: ReplaySubject<string> = new ReplaySubject<string>(1)
    /*
        cardList: ReplaySubject<Card[]> = ;
        cardMap: ReplaySubject<Dictionary<Card[]>>;
    */
    constructor(public db: MyAppDatabase) {
        this.addCard$.pipe(reduce((presentCards: ICard[], newCards: ICard[]) => {
            return presentCards.concat(newCards);
        }, [])).subscribe(this.currentCards$);
        this.currentCardMap$ = this.addCard$.pipe(reduce((acc: Dictionary<ICard[]>, n: ICard[]) => {
            const o = {...acc};
            n.forEach(v => {
                if (o[v.characters]) {
                    o[v.characters].push(v)
                } else {
                    o[v.characters] = [v]
                }
            });
            return o;
        }, {}));
    }
}