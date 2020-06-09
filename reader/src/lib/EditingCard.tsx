import {BehaviorSubject, combineLatest, merge, ReplaySubject} from "rxjs";
import {ICard} from "./worker-safe/icard";
import {LocalStorageManager} from "./Manager";
import {debounceTime, skip, withLatestFrom} from "rxjs/operators";

export class EditingCard {
    id?: number;
    deck$ = new ReplaySubject<string>(1);
    photos$ = new ReplaySubject<string[]>(1);
    frontPhotos$ = new ReplaySubject<string[]>(1);
    sounds$ = new ReplaySubject<string[]>(1);
    english$ = new ReplaySubject<string[]>(1);
    characters$ = new ReplaySubject<string>(1);
    ankiPackage$ = new ReplaySubject<string>(1);
    collection$ = new ReplaySubject<string>(1);

    constructor(public persistor: LocalStorageManager) {
        this.photos$.pipe(skip(1)).subscribe(p => {
            debugger;console.log(p)
        })
        combineLatest(
            [
                combineLatest(
                    [
                        this.photos$,
                        this.sounds$,
                        this.english$,
                        this.frontPhotos$
                    ]
                ),
                this.characters$.pipe(skip(1)),
                combineLatest([
                        this.deck$,
                        this.collection$,
                        this.ankiPackage$
                    ]
                )
            ]
            // This debounce Time and then skip means skip the first emit when we create the EditingCard
        ).pipe(debounceTime(100), skip(1))
            .subscribe((
                [[photos, sounds, english, frontPhotos], characters, [deck, collection, ankiPackage]]
            ) => {
                const iCard: ICard = {
                    id: this.id,
                    collection,
                    deck,
                    photos,
                    sounds,
                    english,
                    characters,
                    ankiPackage,
                    frontPhotos,
                    fields: []
                };
                debugger;
                persistor.upsert(
                    v => v.id === this.id ||
                        (v.deck === deck &&
                            v.ankiPackage === ankiPackage &&
                            v.collection === collection &&
                            v.characters === characters),
                    iCard
                )
            })
        /*
                    .subscribe((
                    [
                        deck,
                        photos,
                        sounds,
                        english,
                        characters,
                        ankiPackage,
                        collection
                    ]:
                        [
                            string,
                            string[],
                            string[],
                            string[],
                            string,
                            string,
                            string]
                ) => {
                    const i: ICard = {
                        deck, photos, sounds, english, characters, ankiPackage, collection
                    }
                    persistor.upsert(v => v.characters === characters && v.deck === deck, )
                })
        */
    }

    static fromICard(iCard: ICard, persistor: LocalStorageManager): EditingCard {
        const e = new EditingCard(persistor);
        e.deck$.next(iCard.deck || "NO_DECK");
        e.collection$.next(iCard.collection || "NO_COLLECTION");
        e.ankiPackage$.next(iCard.ankiPackage || "NO_PACKAGE");
        e.photos$.next(iCard.photos);
        e.sounds$.next(iCard.sounds);
        e.english$.next(iCard.english);
        e.characters$.next(iCard.characters);
        e.frontPhotos$.next(iCard.frontPhotos);
        return e;
    }
}