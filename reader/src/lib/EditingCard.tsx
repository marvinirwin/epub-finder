import {BehaviorSubject, combineLatest, interval, merge, ReplaySubject, Subject, timer} from "rxjs";
import {getIsMeFunction, ICard} from "./worker-safe/icard";
import {debounceTime, map, skip, startWith, switchMap, take, takeUntil, withLatestFrom} from "rxjs/operators";
import {IndexDBManager, LocalStorageManager} from "./StorageManagers";
import {Manager} from "./Manager";

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
    saveCompleteSignal$ = new Subject<boolean>();
    saveProgress$ = new Subject<number>();

    constructor(
        public persistor: IndexDBManager<ICard>,
        public m: Manager,
        public timestamp?: Date | number | undefined,
    ) {
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

        let saveStartSignal$ = combineLatest(
            [
                firstGroup$,
                this.characters$,
                secondGroup$
            ]
            // This debounce Time and then skip means skip the first emit when we create the EditingCard
        );

        let saveDebounceTime = 5000;
        let updateLoaderTime = 1000;
        saveStartSignal$.pipe(
            skip(1),
            switchMap(() => timer(0, updateLoaderTime)),
            map(v => ((v * updateLoaderTime) / saveDebounceTime) * 100),
            takeUntil(this.saveCompleteSignal$)
        ).subscribe(this.saveProgress$);

        saveStartSignal$.pipe(debounceTime(saveDebounceTime), skip(1))
            .subscribe(async (
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
                // I need to handle the case where there is a card cached which is newer than the one getting persisted
                // Whatever, I'll do that later
                // Also I have no idea if isMeWhere is going to work
                const records = await persistor.upsert(
                    iCard,
                    (t: Dexie.Table<ICard>) =>
                        t.where({
                            deck: iCard.deck,
                            ankiPackage: iCard.ankiPackage,
                            collection: iCard.collection,
                            learningLanguage: iCard.learningLanguage
                        })
                            .or("id").equals(iCard.id || 0)
                            .toArray()
                );
                if (!records.length || records.length > 1) {
                    throw new Error("Upserting returned a weird array")
                }
                const rec = records[0];
                this.m.addCards$.next([rec])
                this.saveCompleteSignal$.next(true);
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

    static fromICard(iCard: ICard, persistor: IndexDBManager<ICard>, m: Manager): EditingCard {
        const e = new EditingCard(persistor, m);
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
        e.id = iCard.id;
        return e;
    }
}