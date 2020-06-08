import {BehaviorSubject} from "rxjs";
import {ICard} from "./worker-safe/icard";

export class EditingCard {
    id?: number;
    deck$ = new BehaviorSubject<string>('');
    photos$ = new BehaviorSubject<string[]>([]);
    sounds$ = new BehaviorSubject<string[]>([]);
    english$ = new BehaviorSubject<string[]>([]);
    characters$ = new BehaviorSubject<string>('');

    static fromICard(iCard: ICard): EditingCard {
        const e = new EditingCard();
        e.deck$.next(iCard.deck || "NO_DECK");
        e.photos$.next(iCard.photos);
        e.sounds$.next(iCard.sounds);
        e.english$.next(iCard.english);
        e.characters$.next(iCard.characters);
        return e;
    }
}