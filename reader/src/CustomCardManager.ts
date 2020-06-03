import {ReplaySubject, Subject} from "rxjs";
import {Dictionary} from "lodash";
import {ICard} from "./AppDB";
import {withLatestFrom} from "rxjs/operators";
import {EditingCard, EditingCardInInterface} from "./AppSingleton";

export class CustomCardManager {
    allCustomCards: ReplaySubject<Dictionary<EditingCard>> = new ReplaySubject<Dictionary<EditingCard>>(1)
    cardInEditor$: ReplaySubject<EditingCardInInterface | undefined> = new ReplaySubject<EditingCardInInterface | undefined>(1)
    newCardRequest$: Subject<ICard> = new Subject();

    constructor() {
        this.allCustomCards.next({})
        this.cardInEditor$.next(undefined);
        this.newCardRequest$.pipe(withLatestFrom(this.allCustomCards)).subscribe(([c, cDict]) => {
            let key = `${c.characters}_${c.deck}`;
            const presentCard = cDict[key];
            const ec: EditingCard = presentCard || new EditingCard();
            ec.english$.next(c.english);
            ec.characters$.next(c.characters);
            ec.deck$.next(c.deck || 'NO_DECK_FOR_CARD');
            ec.photos$.next(c.photos);
            ec.sounds$.next(c.sounds);
            if (!presentCard) {
                let value: Dictionary<EditingCard> = {
                    ...cDict,
                    [key]: ec
                };
                this.allCustomCards.next(value)
            }
        })
    }
}