import {Observable, ReplaySubject, Subject} from "rxjs";
import {ICard, MyAppDatabase} from "./AppDB";
import {Dictionary} from "lodash";
import {reduce, scan} from "rxjs/operators";

export class CardManager {
    messages$: ReplaySubject<string> = new ReplaySubject<string>()
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
        this.addCard$.next([]);
        this.messages$.next("Initializing card manager");
        this.addCard$.pipe(scan((presentCards: ICard[], newCards: ICard[]) => {
            this.messages$.next(`Cards received ${newCards.length}`)
            return presentCards.concat(newCards);
        }, [])).subscribe(v => {
            this.currentCards$.next(v);
        });
        this.currentCards$.subscribe(v => {
            this.messages$.next(`New current cards ${v.length}`)
        })
        this.currentCardMap$ = this.addCard$.pipe(scan((acc: Dictionary<ICard[]>, n: ICard[]) => {
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