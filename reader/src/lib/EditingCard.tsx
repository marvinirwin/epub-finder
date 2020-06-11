import {BehaviorSubject, combineLatest, merge, ReplaySubject} from "rxjs";
import {getIsMeFunction, ICard} from "./worker-safe/icard";
import {LocalStorageManager} from "./Manager";
import {debounceTime, skip, withLatestFrom} from "rxjs/operators";

export class EditingCard {
    id?: number;
    deck$ = new ReplaySubject<string>(1);
    photos$ = new ReplaySubject<string[]>(1);
    illustrationPhotos$ = new ReplaySubject<string[]>(1);
    sounds$ = new ReplaySubject<string[]>(1);
    knownLanguage$ = new ReplaySubject<string[]>(1);
    characters$ = new ReplaySubject<string>(1);
    ankiPackage$ = new ReplaySubject<string>(1);
    collection$ = new ReplaySubject<string>(1);

    constructor(public persistor: LocalStorageManager, public timestamp?: Date | number | undefined) {
        let firstGroup$ = combineLatest(
            [
                this.photos$,
                this.sounds$,
                this.knownLanguage$,
                this.illustrationPhotos$
            ]
        );
        let secondGroup$ = combineLatest([
                this.deck$,
                this.collection$,
                this.ankiPackage$
            ]
        );

        let saveSignal$ = combineLatest(
            [
                firstGroup$,
                this.characters$,
                secondGroup$
            ]
            // This debounce Time and then skip means skip the first emit when we create the EditingCard
        );
        saveSignal$.pipe(debounceTime(100), skip(1))
            .subscribe((
                [[photos, sounds, english, frontPhotos], characters, [deck, collection, ankiPackage]]
            ) => {
                const iCard: ICard = {
                    id: this.id,
                    collection,
                    deck,
                    photos,
                    sounds,
                    knownLanguage: english,
                    learningLanguage: characters,
                    ankiPackage,
                    illustrationPhotos: frontPhotos,
                    fields: [],
                    timestamp: this.timestamp || new Date()
                };
                persistor.upsert(
                    getIsMeFunction(iCard),
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
/*
        deck$ = new ReplaySubject<string>(1);
        photos$ = new ReplaySubject<string[]>(1);
        frontPhotos$ = new ReplaySubject<string[]>(1);
        sounds$ = new ReplaySubject<string[]>(1);
        english$ = new ReplaySubject<string[]>(1);
        characters$ = new ReplaySubject<string>(1);
        ankiPackage$ = new ReplaySubject<string>(1);
        collection$ = new ReplaySubject<string>(1);
*/
        e.deck$.next(iCard.deck || "NO_DECK");
        e.photos$.next(iCard.photos);
        e.illustrationPhotos$.next(iCard.illustrationPhotos);
        e.sounds$.next(iCard.sounds);
        e.knownLanguage$.next(iCard.knownLanguage);
        e.characters$.next(iCard.learningLanguage);
        e.ankiPackage$.next(iCard.ankiPackage || "NO_PACKAGE");
        e.collection$.next(iCard.collection || "NO_COLLECTION");
        return e;
    }
}